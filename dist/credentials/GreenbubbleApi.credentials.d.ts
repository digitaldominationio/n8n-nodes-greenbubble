import { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';
export declare class GreenbubbleApi implements ICredentialType {
    name: string;
    displayName: string;
    icon: {
        readonly light: "file:greenbubble.svg";
        readonly dark: "file:greenbubble-dark.svg";
    };
    documentationUrl: string;
    properties: INodeProperties[];
    authenticate: IAuthenticateGeneric;
    test: ICredentialTestRequest;
}
