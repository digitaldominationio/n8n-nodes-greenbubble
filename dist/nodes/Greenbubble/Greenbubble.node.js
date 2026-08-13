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
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
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
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('greenbubbleApi');
        const baseUrl = credentials.baseUrl.replace(/\/$/, '');
        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i);
                const operation = this.getNodeParameter('operation', i);
                let responseData;
                const callApi = async (method, endpoint, options = {}) => {
                    return this.helpers.httpRequestWithAuthentication.call(this, 'greenbubbleApi', {
                        method,
                        url: `${baseUrl}${endpoint}`,
                        qs: options.qs,
                        body: options.body,
                        json: method === 'POST',
                    });
                };
                const buildMessage = (type, payload) => ({
                    type,
                    [type]: payload,
                });
                // ── SENDER ────────────────────────────────────────────────────
                if (resource === 'sender') {
                    if (operation === 'list') {
                        const qs = {};
                        const workspaceId = this.getNodeParameter('workspaceId', i);
                        if (workspaceId)
                            qs.workspace_id = workspaceId;
                        responseData = await callApi('GET', '/api/v2/whatsapp/senders', { qs });
                    }
                }
                // ── MESSAGE ───────────────────────────────────────────────────
                else if (resource === 'message') {
                    const senderId = this.getNodeParameter('senderId', i);
                    const to = this.getNodeParameter('to', i);
                    if (operation === 'sendText') {
                        responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
                            body: {
                                sender_id: senderId,
                                to,
                                message: buildMessage('text', { body: this.getNodeParameter('messageBody', i) }),
                            },
                        });
                    }
                    else if (operation === 'sendTemplate') {
                        const template = {
                            name: this.getNodeParameter('templateName', i),
                            language: this.getNodeParameter('languageCode', i),
                        };
                        const components = [];
                        const bodyVariables = this.getNodeParameter('bodyVariables', i);
                        if (Array.isArray(bodyVariables) && bodyVariables.length) {
                            components.push({
                                type: 'body',
                                parameters: bodyVariables.map((value) => ({ type: 'text', text: String(value) })),
                            });
                        }
                        const headerMedia = this.getNodeParameter('headerMedia', i);
                        if (headerMedia && typeof headerMedia === 'object' && headerMedia.url) {
                            const mediaType = ['image', 'video', 'document'].includes(headerMedia.type) ? headerMedia.type : 'image';
                            components.push({
                                type: 'header',
                                parameters: [{ type: mediaType, [mediaType]: { link: headerMedia.url } }],
                            });
                        }
                        if (components.length)
                            template.components = components;
                        responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
                            body: {
                                sender_id: senderId,
                                to,
                                message: buildMessage('template', template),
                            },
                        });
                    }
                    else if (['sendImage', 'sendVideo', 'sendAudio', 'sendDocument'].includes(operation)) {
                        const mediaType = operation.replace('send', '').toLowerCase();
                        const media = { url: this.getNodeParameter('mediaUrl', i) };
                        const caption = this.getNodeParameter('caption', i, '');
                        if (caption && mediaType !== 'audio')
                            media.caption = caption;
                        if (mediaType === 'document') {
                            const filename = this.getNodeParameter('filename', i, '');
                            if (filename)
                                media.filename = filename;
                        }
                        responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
                            body: {
                                sender_id: senderId,
                                to,
                                message: buildMessage(mediaType, media),
                            },
                        });
                    }
                    else if (operation === 'sendLocation') {
                        const location = {
                            latitude: this.getNodeParameter('latitude', i),
                            longitude: this.getNodeParameter('longitude', i),
                        };
                        const placeName = this.getNodeParameter('placeName', i, '');
                        const address = this.getNodeParameter('address', i, '');
                        if (placeName)
                            location.name = placeName;
                        if (address)
                            location.address = address;
                        responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
                            body: {
                                sender_id: senderId,
                                to,
                                message: buildMessage('location', location),
                            },
                        });
                    }
                    else if (operation === 'sendReaction') {
                        responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
                            body: {
                                sender_id: senderId,
                                to,
                                message: buildMessage('reaction', {
                                    message_id: this.getNodeParameter('reactionMessageId', i),
                                    emoji: this.getNodeParameter('emoji', i),
                                }),
                            },
                        });
                    }
                }
                // ── GROUP ─────────────────────────────────────────────────────
                else if (resource === 'group') {
                    const senderId = this.getNodeParameter('senderId', i);
                    if (operation === 'list') {
                        responseData = await callApi('GET', '/api/v2/whatsapp/groups', { qs: { sender_id: senderId } });
                    }
                    else if (operation === 'listMembers') {
                        const groupId = encodeURIComponent(this.getNodeParameter('groupId', i));
                        responseData = await callApi('GET', `/api/v2/whatsapp/groups/${groupId}/members`, { qs: { sender_id: senderId } });
                    }
                    else if (operation === 'sendMessage') {
                        const body = {
                            sender_id: senderId,
                            message: buildMessage('text', { body: this.getNodeParameter('messageBody', i) }),
                        };
                        const groupId = this.getNodeParameter('groupId', i, '');
                        const groupName = this.getNodeParameter('groupName', i, '');
                        if (groupId)
                            body.group_id = groupId;
                        if (groupName)
                            body.group_name = groupName;
                        const mentions = this.getNodeParameter('mentions', i, []);
                        if (Array.isArray(mentions) && mentions.length)
                            body.mentions = mentions;
                        responseData = await callApi('POST', '/api/v2/whatsapp/groups/messages', { body });
                    }
                }
                // ── TEMPLATE ──────────────────────────────────────────────────
                else if (resource === 'template') {
                    if (operation === 'create') {
                        const body = {
                            waba_id: this.getNodeParameter('wabaId', i),
                            template_name: this.getNodeParameter('templateName', i),
                            category: this.getNodeParameter('category', i),
                            language: this.getNodeParameter('language', i),
                            message_body: this.getNodeParameter('messageBody', i),
                        };
                        const headerText = this.getNodeParameter('headerText', i, '');
                        const footerText = this.getNodeParameter('footerText', i, '');
                        if (headerText)
                            body.header_text = headerText;
                        if (footerText)
                            body.footer_text = footerText;
                        const additionalFields = this.getNodeParameter('additionalFields', i, {});
                        if (additionalFields.buttons)
                            body.buttons = additionalFields.buttons;
                        if (additionalFields.variable_examples)
                            body.variable_examples = additionalFields.variable_examples;
                        responseData = await callApi('POST', '/api/v2/templates/create', { body });
                    }
                }
                // ── CAMPAIGN ──────────────────────────────────────────────────
                else if (resource === 'campaign') {
                    if (operation === 'create') {
                        const recipientType = this.getNodeParameter('recipientType', i);
                        const body = {
                            name: this.getNodeParameter('campaignName', i),
                            waba_id: this.getNodeParameter('wabaId', i),
                            template_name: this.getNodeParameter('templateName', i),
                            recipient_type: recipientType,
                        };
                        if (recipientType === 'specific_contacts') {
                            const contactNumbers = this.getNodeParameter('contactNumbers', i, []);
                            if (Array.isArray(contactNumbers) && contactNumbers.length)
                                body.contact_numbers = contactNumbers;
                        }
                        else if (recipientType === 'tags') {
                            const tagIds = this.getNodeParameter('tagIds', i, []);
                            if (Array.isArray(tagIds) && tagIds.length)
                                body.tag_ids = tagIds;
                        }
                        const variablesMapping = this.getNodeParameter('variablesMapping', i, {});
                        if (variablesMapping && Object.keys(variablesMapping).length)
                            body.variables_mapping = variablesMapping;
                        const mediaUrl = this.getNodeParameter('mediaUrl', i, '');
                        if (mediaUrl)
                            body.media_url = mediaUrl;
                        responseData = await callApi('POST', '/api/v2/campaigns', { body });
                    }
                    else if (operation === 'list') {
                        responseData = await callApi('GET', '/api/v2/campaigns');
                    }
                }
                // ── CONTACT ───────────────────────────────────────────────────
                else if (resource === 'contact') {
                    if (operation === 'create') {
                        responseData = await callApi('POST', '/api/v2/contacts', {
                            body: {
                                phone_number: this.getNodeParameter('phoneNumber', i),
                                name: this.getNodeParameter('name', i),
                                email: this.getNodeParameter('email', i),
                            },
                        });
                    }
                    else if (operation === 'list') {
                        responseData = await callApi('GET', '/api/v2/contacts');
                    }
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
                }
                // Normalise response
                const arrayKey = ['data', 'contacts', 'campaigns'].find((key) => Array.isArray(responseData === null || responseData === void 0 ? void 0 : responseData[key]));
                if (arrayKey) {
                    returnData.push(...responseData[arrayKey].map((item) => ({ json: item, pairedItem: { item: i } })));
                }
                else {
                    returnData.push({ json: responseData, pairedItem: { item: i } });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
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