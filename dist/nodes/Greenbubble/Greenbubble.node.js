"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Greenbubble = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const descriptions_1 = require("./descriptions");
class Greenbubble {
    constructor() {
        this.description = {
            displayName: 'GreenBubble',
            name: 'greenbubble',
            icon: 'file:greenbubble.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Interact with the GreenBubble WhatsApp automation platform',
            defaults: {
                name: 'GreenBubble',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'greenbubbleApi',
                    required: true,
                },
            ],
            properties: [
                descriptions_1.resourceOptions,
                ...descriptions_1.operationOptions,
                ...descriptions_1.fields,
            ],
        };
    }
    async execute() {
        var _a, _b;
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('greenbubbleApi');
        const baseUrl = credentials.baseUrl.replace(/\/$/, '');
        const apiToken = credentials.apiToken;
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);
                let responseData;
                const callApi = async (method, endpoint, body = {}) => {
                    const options = {
                        method,
                        url: `${baseUrl}${endpoint}`,
                        json: true,
                    };
                    if (method === 'POST') {
                        options.form = { apiToken, ...body };
                    }
                    else {
                        options.qs = { apiToken, ...body };
                    }
                    return this.helpers.request(options);
                };
                // ── MESSAGE ───────────────────────────────────────────────────
                if (resource === 'message') {
                    if (operation === 'sendText') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/send', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            message: this.getNodeParameter('message', i),
                        });
                    }
                    else if (operation === 'sendTemplate') {
                        const templateVars = (_b = (_a = this.getNodeParameter('templateVariableValues', i)) === null || _a === void 0 ? void 0 : _a.variable) !== null && _b !== void 0 ? _b : [];
                        const body = {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            template_id: this.getNodeParameter('templateId', i),
                        };
                        // Build templateVariable-Name-Index params dynamically
                        for (const v of templateVars) {
                            body[`templateVariable-${v.name}-${v.index}`] = v.value;
                        }
                        const quickReply = this.getNodeParameter('quickReplyButtonValues', i);
                        if (quickReply)
                            body.template_quick_reply_button_values = quickReply;
                        responseData = await callApi('POST', '/api/v1/whatsapp/send/template', body);
                    }
                    else if (operation === 'sendBroadcast') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/broadcast/template/send', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            flow_data: JSON.stringify(this.getNodeParameter('flowData', i)),
                        });
                    }
                    else if (operation === 'getConversation') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/get/conversation', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            limit: this.getNodeParameter('limit', i),
                            offset: this.getNodeParameter('offset', i),
                        });
                    }
                    else if (operation === 'getStatus') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/get/message-status', {
                            wa_message_id: this.getNodeParameter('waMessageId', i),
                            whatsapp_bot_id: this.getNodeParameter('whatsappBotId', i),
                        });
                    }
                    else if (operation === 'getPostbacks') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/get/post-back-list', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                        });
                    }
                }
                // ── SUBSCRIBER ────────────────────────────────────────────────
                else if (resource === 'subscriber') {
                    if (operation === 'get') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/get', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                        });
                    }
                    else if (operation === 'list') {
                        const orderBy = this.getNodeParameter('orderBy', i);
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/list', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            limit: this.getNodeParameter('limit', i),
                            offset: this.getNodeParameter('offset', i),
                            orderBy: orderBy ? 1 : 0,
                        });
                    }
                    else if (operation === 'create') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/create', {
                            phoneNumberID: this.getNodeParameter('phoneNumberId', i),
                            name: this.getNodeParameter('name', i),
                            phoneNumber: this.getNodeParameter('phoneNumber', i),
                        });
                    }
                    else if (operation === 'update') {
                        const updateFields = this.getNodeParameter('updateFields', i);
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/update', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            ...updateFields,
                        });
                    }
                    else if (operation === 'delete') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/delete', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                        });
                    }
                    else if (operation === 'resetFlow') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/reset/user-input-flow', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                        });
                    }
                    else if (operation === 'assignTeam') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/assign-to-team-member', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            team_member_id: this.getNodeParameter('teamMemberId', i),
                        });
                    }
                    else if (operation === 'assignCustomFields') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/assign-custom-fields', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            custom_fields: JSON.stringify(this.getNodeParameter('customFields', i)),
                        });
                    }
                    else if (operation === 'listCustomFields') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/custom-fields/list', {});
                    }
                    else if (operation === 'assignLabels') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/assign-labels', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            label_ids: this.getNodeParameter('labelIds', i),
                        });
                    }
                    else if (operation === 'removeLabels') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/remove-labels', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            label_ids: this.getNodeParameter('labelIds', i),
                        });
                    }
                    else if (operation === 'assignSequences') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/assign-sequence', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            sequence_ids: this.getNodeParameter('sequenceIds', i),
                        });
                    }
                    else if (operation === 'removeSequences') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/remove-sequence', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            sequence_ids: this.getNodeParameter('sequenceIds', i),
                        });
                    }
                    else if (operation === 'addNote') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/add-notes', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                            note_text: this.getNodeParameter('noteText', i),
                        });
                    }
                }
                // ── LABEL ─────────────────────────────────────────────────────
                else if (resource === 'label') {
                    const phoneNumberId = this.getNodeParameter('phoneNumberId', i);
                    if (operation === 'list') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/label/list', { phone_number_id: phoneNumberId });
                    }
                    else if (operation === 'create') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/label/create', {
                            phone_number_id: phoneNumberId,
                            label_name: this.getNodeParameter('labelName', i),
                        });
                    }
                }
                // ── CATALOG ───────────────────────────────────────────────────
                else if (resource === 'catalog') {
                    if (operation === 'list') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/catalog/list', {});
                    }
                    else if (operation === 'sync') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/catalog/sync', {
                            whatsapp_catalog_id: this.getNodeParameter('catalogId', i),
                        });
                    }
                    else if (operation === 'listOrders') {
                        const catalogId = this.getNodeParameter('catalogId', i);
                        const body = {};
                        if (catalogId)
                            body.whatsapp_catalog_id = catalogId;
                        responseData = await callApi('POST', '/api/v1/whatsapp/catalog/order/list', body);
                    }
                    else if (operation === 'updateOrder') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/catalog/order/status-change', {
                            order_unique_id: this.getNodeParameter('orderUniqueId', i),
                            cart_status: this.getNodeParameter('cartStatus', i),
                        });
                    }
                }
                // ── BOT ───────────────────────────────────────────────────────
                else if (resource === 'bot') {
                    if (operation === 'triggerFlow') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/trigger-bot', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                            bot_flow_unique_id: this.getNodeParameter('botFlowUniqueId', i),
                            phone_number: this.getNodeParameter('phoneNumber', i),
                        });
                    }
                    else if (operation === 'listTemplates') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/template/list', {
                            phone_number_id: this.getNodeParameter('phoneNumberId', i),
                        });
                    }
                }
                // ── ACCOUNT ───────────────────────────────────────────────────
                else if (resource === 'account') {
                    if (operation === 'connect') {
                        responseData = await callApi('POST', '/api/v1/whatsapp/account/connect', {
                            user_id: this.getNodeParameter('userId', i),
                            whatsapp_business_account_id: this.getNodeParameter('whatsappBusinessAccountId', i),
                            access_token: this.getNodeParameter('accessToken', i),
                        });
                    }
                }
                // ── USER ──────────────────────────────────────────────────────
                else if (resource === 'user') {
                    if (operation === 'getLoginUrl') {
                        const email = this.getNodeParameter('email', i);
                        const additionalFields = this.getNodeParameter('additionalFields', i);
                        const body = { email };
                        if (additionalFields.name)
                            body.name = additionalFields.name;
                        if (additionalFields.mobile)
                            body.mobile = additionalFields.mobile;
                        if (additionalFields.package_id)
                            body.package_id = additionalFields.package_id;
                        if (additionalFields.expired_date)
                            body.expired_date = additionalFields.expired_date;
                        if (additionalFields.status !== undefined)
                            body.status = additionalFields.status;
                        if (additionalFields.create_on_fail !== undefined) {
                            body.create_on_fail = additionalFields.create_on_fail ? 1 : 0;
                        }
                        responseData = await callApi('POST', '/api/v1/user/get/direct-login-url', body);
                    }
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
                }
                // Normalise response
                if (Array.isArray(responseData === null || responseData === void 0 ? void 0 : responseData.message)) {
                    returnData.push(...responseData.message.map((item) => ({ json: item })));
                }
                else {
                    returnData.push({ json: responseData });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message }, pairedItem: i });
                    continue;
                }
                if (error instanceof n8n_workflow_1.NodeApiError || error instanceof n8n_workflow_1.NodeOperationError)
                    throw error;
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
            }
        }
        return [returnData];
    }
}
exports.Greenbubble = Greenbubble;
//# sourceMappingURL=Greenbubble.node.js.map