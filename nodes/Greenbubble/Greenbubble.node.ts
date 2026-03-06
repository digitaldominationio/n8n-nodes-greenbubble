import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

import { resourceOptions, operationOptions, fields } from './descriptions';

export class Greenbubble implements INodeType {
	description: INodeTypeDescription = {
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
			resourceOptions,
			...operationOptions,
			...fields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('greenbubbleApi');

		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
		const apiToken = credentials.apiToken as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const resource  = this.getNodeParameter('resource',  i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: any;

				const callApi = async (
					method: 'GET' | 'POST',
					endpoint: string,
					body: Record<string, any> = {},
				) => {
					if (method === 'POST') {
						return this.helpers.httpRequest({
							method,
							url: `${baseUrl}${endpoint}`,
							headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
							body: new URLSearchParams({ apiToken, ...Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v)])) }).toString(),
						});
					} else {
						return this.helpers.httpRequest({
							method,
							url: `${baseUrl}${endpoint}`,
							qs: { apiToken, ...body },
						});
					}
				};

				// ── MESSAGE ───────────────────────────────────────────────────
				if (resource === 'message') {
					if (operation === 'sendText') {
						responseData = await callApi('POST', '/api/v1/whatsapp/send', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							message:         this.getNodeParameter('message',       i),
						});
					} else if (operation === 'sendTemplate') {
							const templateVars = (this.getNodeParameter('templateVariableValues', i) as any)?.variable ?? [];
						const body: Record<string, any> = {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							template_id:     this.getNodeParameter('templateId',    i),
						};
						// Build templateVariable-Name-Index params dynamically
						for (const v of templateVars) {
							body[`templateVariable-${v.name}-${v.index}`] = v.value;
						}
						const quickReply = this.getNodeParameter('quickReplyButtonValues', i) as string;
						if (quickReply) body.template_quick_reply_button_values = quickReply;
						responseData = await callApi('POST', '/api/v1/whatsapp/send/template', body);
					} else if (operation === 'sendBroadcast') {
						responseData = await callApi('POST', '/api/v1/whatsapp/broadcast/template/send', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							flow_data:       JSON.stringify(this.getNodeParameter('flowData', i)),
						});
					} else if (operation === 'getConversation') {
						responseData = await callApi('POST', '/api/v1/whatsapp/get/conversation', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							limit:           this.getNodeParameter('limit',         i),
							offset:          this.getNodeParameter('offset',        i),
						});
					} else if (operation === 'getStatus') {
						responseData = await callApi('POST', '/api/v1/whatsapp/get/message-status', {
							wa_message_id:   this.getNodeParameter('waMessageId',   i),
							whatsapp_bot_id: this.getNodeParameter('whatsappBotId', i),
						});
					} else if (operation === 'getPostbacks') {
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
							phone_number:    this.getNodeParameter('phoneNumber',   i),
						});
					} else if (operation === 'list') {
						const orderBy = this.getNodeParameter('orderBy', i) as boolean;
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/list', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							limit:           this.getNodeParameter('limit',         i),
							offset:          this.getNodeParameter('offset',        i),
							orderBy:         orderBy ? 1 : 0,
						});
					} else if (operation === 'create') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/create', {
							phoneNumberID: this.getNodeParameter('phoneNumberId', i),
							name:          this.getNodeParameter('name',          i),
							phoneNumber:   this.getNodeParameter('phoneNumber',   i),
						});
					} else if (operation === 'update') {
						const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/update', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							...updateFields,
						});
					} else if (operation === 'delete') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/delete', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
						});
					} else if (operation === 'resetFlow') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/reset/user-input-flow', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
						});
					} else if (operation === 'assignTeam') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/assign-to-team-member', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							team_member_id:  this.getNodeParameter('teamMemberId',  i),
						});
					} else if (operation === 'assignCustomFields') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/assign-custom-fields', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							custom_fields:   JSON.stringify(this.getNodeParameter('customFields', i)),
						});
					} else if (operation === 'listCustomFields') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/custom-fields/list', {});
					} else if (operation === 'assignLabels') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/assign-labels', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							label_ids:       this.getNodeParameter('labelIds',      i),
						});
					} else if (operation === 'removeLabels') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/remove-labels', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							label_ids:       this.getNodeParameter('labelIds',      i),
						});
					} else if (operation === 'assignSequences') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/assign-sequence', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							sequence_ids:    this.getNodeParameter('sequenceIds',   i),
						});
					} else if (operation === 'removeSequences') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/remove-sequence', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							sequence_ids:    this.getNodeParameter('sequenceIds',   i),
						});
					} else if (operation === 'addNote') {
						responseData = await callApi('POST', '/api/v1/whatsapp/subscriber/chat/add-notes', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
							phone_number:    this.getNodeParameter('phoneNumber',   i),
							note_text:       this.getNodeParameter('noteText',      i),
						});
					}
				}

				// ── LABEL ─────────────────────────────────────────────────────
				else if (resource === 'label') {
					const phoneNumberId = this.getNodeParameter('phoneNumberId', i) as string;
					if (operation === 'list') {
						responseData = await callApi('POST', '/api/v1/whatsapp/label/list', { phone_number_id: phoneNumberId });
					} else if (operation === 'create') {
						responseData = await callApi('POST', '/api/v1/whatsapp/label/create', {
							phone_number_id: phoneNumberId,
							label_name:      this.getNodeParameter('labelName', i),
						});
					}
				}

				// ── CATALOG ───────────────────────────────────────────────────
				else if (resource === 'catalog') {
					if (operation === 'list') {
						responseData = await callApi('POST', '/api/v1/whatsapp/catalog/list', {});
					} else if (operation === 'sync') {
						responseData = await callApi('POST', '/api/v1/whatsapp/catalog/sync', {
							whatsapp_catalog_id: this.getNodeParameter('catalogId', i),
						});
					} else if (operation === 'listOrders') {
						const catalogId = this.getNodeParameter('catalogId', i) as string;
						const body: Record<string, any> = {};
						if (catalogId) body.whatsapp_catalog_id = catalogId;
						responseData = await callApi('POST', '/api/v1/whatsapp/catalog/order/list', body);
					} else if (operation === 'updateOrder') {
						responseData = await callApi('POST', '/api/v1/whatsapp/catalog/order/status-change', {
							order_unique_id: this.getNodeParameter('orderUniqueId', i),
							cart_status:     this.getNodeParameter('cartStatus',    i),
						});
					}
				}

				// ── BOT ───────────────────────────────────────────────────────
				else if (resource === 'bot') {
					if (operation === 'triggerFlow') {
						responseData = await callApi('POST', '/api/v1/whatsapp/trigger-bot', {
							phone_number_id:    this.getNodeParameter('phoneNumberId',   i),
							bot_flow_unique_id: this.getNodeParameter('botFlowUniqueId', i),
							phone_number:       this.getNodeParameter('phoneNumber',     i),
						});
					} else if (operation === 'listTemplates') {
						responseData = await callApi('POST', '/api/v1/whatsapp/template/list', {
							phone_number_id: this.getNodeParameter('phoneNumberId', i),
						});
					}
				}

				// ── ACCOUNT ───────────────────────────────────────────────────
				else if (resource === 'account') {
					if (operation === 'connect') {
						responseData = await callApi('POST', '/api/v1/whatsapp/account/connect', {
							user_id:                       this.getNodeParameter('userId',                    i),
							whatsapp_business_account_id:  this.getNodeParameter('whatsappBusinessAccountId', i),
							access_token:                  this.getNodeParameter('accessToken',               i),
						});
					}
				}

				// ── USER ──────────────────────────────────────────────────────
				else if (resource === 'user') {
					if (operation === 'getLoginUrl') {
						const email            = this.getNodeParameter('email',            i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;
						const body: Record<string, any> = { email };
						if (additionalFields.name)                     body.name           = additionalFields.name;
						if (additionalFields.mobile)                   body.mobile         = additionalFields.mobile;
						if (additionalFields.package_id)               body.package_id     = additionalFields.package_id;
						if (additionalFields.expired_date)             body.expired_date   = additionalFields.expired_date;
						if (additionalFields.status !== undefined)     body.status         = additionalFields.status;
						if (additionalFields.create_on_fail !== undefined) {
							body.create_on_fail = additionalFields.create_on_fail ? 1 : 0;
						}
						responseData = await callApi('POST', '/api/v1/user/get/direct-login-url', body);
					}
				}

				else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				// Normalise response
				if (Array.isArray(responseData?.message)) {
					returnData.push(...responseData.message.map((item: any) => ({ json: item })));
				} else {
					returnData.push({ json: responseData });
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
					continue;
				}
				if (error instanceof NodeApiError || error instanceof NodeOperationError) throw error;
				throw new NodeApiError(this.getNode(), error as any);
			}
		}

		return [returnData];
	}
}
