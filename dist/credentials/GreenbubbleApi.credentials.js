"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GreenbubbleApi = void 0;
class GreenbubbleApi {
    constructor() {
        this.name = 'greenbubbleApi';
        this.displayName = 'GreenBubble API';
        this.icon = 'file:greenbubble.svg';
        this.documentationUrl = 'https://app.greenbubble.io/developer';
        this.properties = [
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
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'x-api-key': '={{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/api/v2/whatsapp/senders',
                method: 'GET',
            },
        };
    }
}
exports.GreenbubbleApi = GreenbubbleApi;
//# sourceMappingURL=GreenbubbleApi.credentials.js.map