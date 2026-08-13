import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeConnectionTypes,
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
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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

		for (let i = 0; i < items.length; i++) {
			try {
				const resource  = this.getNodeParameter('resource',  i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: any;

				const callApi = async (
					method: 'GET' | 'POST',
					endpoint: string,
					options: { qs?: Record<string, any>; body?: Record<string, any> } = {},
				) => {
					return this.helpers.httpRequestWithAuthentication.call(this, 'greenbubbleApi', {
						method,
						url: `${baseUrl}${endpoint}`,
						qs: options.qs,
						body: options.body,
						json: method === 'POST',
					});
				};

				const buildMessage = (type: string, payload: Record<string, any>) => ({
					type,
					[type]: payload,
				});

				// ── SENDER ────────────────────────────────────────────────────
				if (resource === 'sender') {
					if (operation === 'list') {
						const qs: Record<string, any> = {};
						const workspaceId = this.getNodeParameter('workspaceId', i) as string;
						if (workspaceId) qs.workspace_id = workspaceId;
						responseData = await callApi('GET', '/api/v2/whatsapp/senders', { qs });
					}
				}

				// ── MESSAGE ───────────────────────────────────────────────────
				else if (resource === 'message') {
					const senderId = this.getNodeParameter('senderId', i) as string;
					const to = this.getNodeParameter('to', i) as string;

					if (operation === 'sendText') {
						responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
							body: {
								sender_id: senderId,
								to,
								message: buildMessage('text', { body: this.getNodeParameter('messageBody', i) }),
							},
						});
					} else if (operation === 'sendTemplate') {
						const template: Record<string, any> = {
							name: this.getNodeParameter('templateName', i),
							language: this.getNodeParameter('languageCode', i),
						};
						const components: any[] = [];

						const bodyVariables = this.getNodeParameter('bodyVariables', i);
						if (Array.isArray(bodyVariables) && bodyVariables.length) {
							components.push({
								type: 'body',
								parameters: bodyVariables.map((value) => ({ type: 'text', text: String(value) })),
							});
						}

						const headerMedia = this.getNodeParameter('headerMedia', i) as Record<string, any>;
						if (headerMedia && typeof headerMedia === 'object' && headerMedia.url) {
							const mediaType = ['image', 'video', 'document'].includes(headerMedia.type) ? headerMedia.type : 'image';
							components.push({
								type: 'header',
								parameters: [{ type: mediaType, [mediaType]: { link: headerMedia.url } }],
							});
						}

						if (components.length) template.components = components;

						responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
							body: {
								sender_id: senderId,
								to,
								message: buildMessage('template', template),
							},
						});
					} else if (['sendImage', 'sendVideo', 'sendAudio', 'sendDocument'].includes(operation)) {
						const mediaType = operation.replace('send', '').toLowerCase();
						const media: Record<string, any> = { url: this.getNodeParameter('mediaUrl', i) };
						const caption = this.getNodeParameter('caption', i, '') as string;
						if (caption && mediaType !== 'audio') media.caption = caption;
						if (mediaType === 'document') {
							const filename = this.getNodeParameter('filename', i, '') as string;
							if (filename) media.filename = filename;
						}
						responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
							body: {
								sender_id: senderId,
								to,
								message: buildMessage(mediaType, media),
							},
						});
					} else if (operation === 'sendLocation') {
						const location: Record<string, any> = {
							latitude: this.getNodeParameter('latitude', i),
							longitude: this.getNodeParameter('longitude', i),
						};
						const placeName = this.getNodeParameter('placeName', i, '') as string;
						const address = this.getNodeParameter('address', i, '') as string;
						if (placeName) location.name = placeName;
						if (address) location.address = address;
						responseData = await callApi('POST', '/api/v2/whatsapp/messages', {
							body: {
								sender_id: senderId,
								to,
								message: buildMessage('location', location),
							},
						});
					} else if (operation === 'sendReaction') {
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
					const senderId = this.getNodeParameter('senderId', i) as string;

					if (operation === 'list') {
						responseData = await callApi('GET', '/api/v2/whatsapp/groups', { qs: { sender_id: senderId } });
					} else if (operation === 'listMembers') {
						const groupId = encodeURIComponent(this.getNodeParameter('groupId', i) as string);
						responseData = await callApi('GET', `/api/v2/whatsapp/groups/${groupId}/members`, { qs: { sender_id: senderId } });
					} else if (operation === 'sendMessage') {
						const body: Record<string, any> = {
							sender_id: senderId,
							message: buildMessage('text', { body: this.getNodeParameter('messageBody', i) }),
						};
						const groupId = this.getNodeParameter('groupId', i, '') as string;
						const groupName = this.getNodeParameter('groupName', i, '') as string;
						if (groupId) body.group_id = groupId;
						if (groupName) body.group_name = groupName;
						const mentions = this.getNodeParameter('mentions', i, []);
						if (Array.isArray(mentions) && mentions.length) body.mentions = mentions;
						responseData = await callApi('POST', '/api/v2/whatsapp/groups/messages', { body });
					}
				}

				// ── TEMPLATE ──────────────────────────────────────────────────
				else if (resource === 'template') {
					if (operation === 'create') {
						const body: Record<string, any> = {
							waba_id: this.getNodeParameter('wabaId', i),
							template_name: this.getNodeParameter('templateName', i),
							category: this.getNodeParameter('category', i),
							language: this.getNodeParameter('language', i),
							message_body: this.getNodeParameter('messageBody', i),
						};
						const headerText = this.getNodeParameter('headerText', i, '') as string;
						const footerText = this.getNodeParameter('footerText', i, '') as string;
						if (headerText) body.header_text = headerText;
						if (footerText) body.footer_text = footerText;

						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
						if (additionalFields.buttons) body.buttons = additionalFields.buttons;
						if (additionalFields.variable_examples) body.variable_examples = additionalFields.variable_examples;

						responseData = await callApi('POST', '/api/v2/templates/create', { body });
					}
				}

				// ── CAMPAIGN ──────────────────────────────────────────────────
				else if (resource === 'campaign') {
					if (operation === 'create') {
						const recipientType = this.getNodeParameter('recipientType', i) as string;
						const body: Record<string, any> = {
							name: this.getNodeParameter('campaignName', i),
							waba_id: this.getNodeParameter('wabaId', i),
							template_name: this.getNodeParameter('templateName', i),
							recipient_type: recipientType,
						};

						if (recipientType === 'specific_contacts') {
							const contactNumbers = this.getNodeParameter('contactNumbers', i, []);
							if (Array.isArray(contactNumbers) && contactNumbers.length) body.contact_numbers = contactNumbers;
						} else if (recipientType === 'tags') {
							const tagIds = this.getNodeParameter('tagIds', i, []);
							if (Array.isArray(tagIds) && tagIds.length) body.tag_ids = tagIds;
						}

						const variablesMapping = this.getNodeParameter('variablesMapping', i, {}) as Record<string, any>;
						if (variablesMapping && Object.keys(variablesMapping).length) body.variables_mapping = variablesMapping;

						const mediaUrl = this.getNodeParameter('mediaUrl', i, '') as string;
						if (mediaUrl) body.media_url = mediaUrl;

						responseData = await callApi('POST', '/api/v2/campaigns', { body });
					} else if (operation === 'list') {
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
					} else if (operation === 'list') {
						responseData = await callApi('GET', '/api/v2/contacts');
					}
				}

				else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				// Normalise response
				const arrayKey = ['data', 'contacts', 'campaigns'].find((key) => Array.isArray(responseData?.[key]));
				if (arrayKey) {
					returnData.push(...(responseData[arrayKey] as any[]).map((item: any) => ({ json: item, pairedItem: { item: i } })));
				} else {
					returnData.push({ json: responseData, pairedItem: { item: i } });
				}

			} catch (error) {
				const detail =
					error instanceof NodeApiError
						? (error.description ?? error.message)
						: error instanceof NodeOperationError
							? error.message
							: (error as Error).message;
				const responseBody =
					error instanceof NodeApiError ? (error as any).context?.data : undefined;
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: detail, ...(responseBody ?? {}) },
						pairedItem: { item: i },
					});
					continue;
				}
				if (error instanceof NodeApiError || error instanceof NodeOperationError) throw error;
				throw new NodeApiError(this.getNode(), error as any);
			}
		}

		return [returnData];
	}
}
