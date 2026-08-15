import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GreenbubbleApi implements ICredentialType {
	name = 'greenbubbleApi';
	displayName = 'GreenBubble API';
	icon = { light: 'file:greenbubble.svg', dark: 'file:greenbubble-dark.svg' } as const;
	documentationUrl = 'https://app.greenbubble.io/developer';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your GreenBubble API key from the Developer Dashboard',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.greenbubble.io',
			description: 'Base URL for the GreenBubble API (change only if self-hosted)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v2/whatsapp/senders',
			method: 'GET',
		},
	};
}
