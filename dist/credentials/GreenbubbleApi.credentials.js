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
                displayName: 'API Token',
                name: 'apiToken',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'Your GreenBubble API token from the Developer Dashboard',
            },
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://app.greenbubble.io',
                description: 'Base URL for the GreenBubble API (change only if self-hosted)',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                qs: {
                    apiToken: '={{$credentials.apiToken}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/api/v1/whatsapp/catalog/list',
                method: 'POST',
                body: {
                    apiToken: '={{$credentials.apiToken}}',
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        };
    }
}
exports.GreenbubbleApi = GreenbubbleApi;
//# sourceMappingURL=GreenbubbleApi.credentials.js.map