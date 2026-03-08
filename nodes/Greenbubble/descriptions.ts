import { INodeProperties } from 'n8n-workflow';

// ─── Resource options ────────────────────────────────────────────────────────
export const resourceOptions: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{ name: 'Message',    value: 'message'    },
		{ name: 'Subscriber', value: 'subscriber' },
		{ name: 'Label',      value: 'label'      },
		{ name: 'Catalog',    value: 'catalog'    },
		{ name: 'Bot',        value: 'bot'        },
		{ name: 'Account',    value: 'account'    },
		{ name: 'User',       value: 'user'       },
	],
	default: 'message',
};

// ─── Operation options per resource ──────────────────────────────────────────
export const operationOptions: INodeProperties[] = [
	// MESSAGE
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['message'] } },
		options: [
			{ name: 'Send Text Message',       value: 'sendText',        action: 'Send a text message to a WhatsApp number'         },
			{ name: 'Send Template Message',   value: 'sendTemplate',    action: 'Send a pre-approved template message'             },
			{ name: 'Send Broadcast Template', value: 'sendBroadcast',   action: 'Send a broadcast template campaign'               },
			{ name: 'Get Conversation',        value: 'getConversation', action: 'Get conversation history for a subscriber'        },
			{ name: 'Get Delivery Status',     value: 'getStatus',       action: 'Get delivery status of a sent message'            },
			{ name: 'Get PostBack List',       value: 'getPostbacks',    action: 'Get list of post-back triggers for a phone number' },
		],
		default: 'sendText',
	},

	// SUBSCRIBER
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['subscriber'] } },
		options: [
			{ name: 'Get Subscriber',          value: 'get',                action: 'Get a subscriber by phone number'            },
			{ name: 'List Subscribers',        value: 'list',               action: 'List all subscribers'                       },
			{ name: 'Create Subscriber',       value: 'create',             action: 'Create a new subscriber/contact'            },
			{ name: 'Update Subscriber',       value: 'update',             action: 'Update an existing subscriber'              },
			{ name: 'Delete Subscriber',       value: 'delete',             action: 'Delete a subscriber'                        },
			{ name: 'Reset User Input Flow',   value: 'resetFlow',          action: 'Reset the user input flow for a subscriber' },
			{ name: 'Assign to Team Member',   value: 'assignTeam',         action: "Assign subscriber's chat to a team member"  },
			{ name: 'Assign Custom Fields',    value: 'assignCustomFields', action: 'Assign custom field values to a subscriber' },
			{ name: 'List Custom Fields',      value: 'listCustomFields',   action: 'Get all available custom fields'            },
			{ name: 'Assign Labels',           value: 'assignLabels',       action: 'Assign labels to a subscriber'              },
			{ name: 'Remove Labels',           value: 'removeLabels',       action: 'Remove labels from a subscriber'            },
			{ name: 'Assign Sequences',        value: 'assignSequences',    action: 'Assign sequences to a subscriber'           },
			{ name: 'Remove Sequences',        value: 'removeSequences',    action: 'Remove sequences from a subscriber'         },
			{ name: 'Add Note',                value: 'addNote',            action: 'Add a note to a subscriber'                 },
		],
		default: 'get',
	},

	// LABEL
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['label'] } },
		options: [
			{ name: 'List Labels',  value: 'list',   action: 'Get all labels for a WhatsApp account' },
			{ name: 'Create Label', value: 'create', action: 'Create a new label'                    },
		],
		default: 'list',
	},

	// CATALOG
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['catalog'] } },
		options: [
			{ name: 'List Catalogs',       value: 'list',        action: 'List all catalogs'             },
			{ name: 'Sync Catalog',        value: 'sync',        action: 'Sync products for a catalog'   },
			{ name: 'List Orders',         value: 'listOrders',  action: 'List catalog orders'           },
			{ name: 'Update Order Status', value: 'updateOrder', action: 'Change the status of an order' },
		],
		default: 'list',
	},

	// BOT
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['bot'] } },
		options: [
			{ name: 'Trigger Bot Flow',   value: 'triggerFlow',   action: 'Trigger a bot flow to a phone number'  },
			{ name: 'List Bot Templates', value: 'listTemplates', action: 'Get all bot templates for an account'  },
		],
		default: 'triggerFlow',
	},

	// ACCOUNT
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{ name: 'Connect Account', value: 'connect', action: 'Connect a WhatsApp Business Account' },
		],
		default: 'connect',
	},

	// USER
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['user'] } },
		options: [
			{ name: 'Get Direct Login URL', value: 'getLoginUrl', action: 'Get a one-time direct login URL for a user' },
		],
		default: 'getLoginUrl',
	},
];

// ─── Shared field helpers ─────────────────────────────────────────────────────
const phoneNumberIdField = (resources: string[], operations: string[]): INodeProperties => ({
	displayName: 'Phone Number ID',
	name: 'phoneNumberId',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: resources, operation: operations } },
	description: 'Your WhatsApp Business phone number ID from the GreenBubble account',
});

const phoneNumberField = (resources: string[], operations: string[], description = 'Subscriber phone number with country code (no + sign)'): INodeProperties => ({
	displayName: 'Phone Number',
	name: 'phoneNumber',
	type: 'string',
	default: '',
	required: true,
	displayOptions: { show: { resource: resources, operation: operations } },
	description,
});

// ─── Field definitions ────────────────────────────────────────────────────────
export const fields: INodeProperties[] = [

	// ── MESSAGE: Send Text ────────────────────────────────────────────────────
	phoneNumberIdField(['message'], ['sendText']),
	phoneNumberField(['message'], ['sendText'], 'Recipient phone number with country code (numeric only, no + sign)'),
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		typeOptions: { rows: 4 },
		default: '',
		required: true,
		displayOptions: { show: { resource: ['message'], operation: ['sendText'] } },
		description: 'Text message to send',
	},

	// ── MESSAGE: Send Template ────────────────────────────────────────────────
	phoneNumberIdField(['message'], ['sendTemplate']),
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['message'], operation: ['sendTemplate'] } },
		description: 'Recipient phone number with country code (numeric only)',
	},
	{
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['message'], operation: ['sendTemplate'] } },
		description: 'Numeric ID of the approved template (found in GreenBubble template list)',
	},
	{
		displayName: 'Template Variables',
		name: 'templateVariableValues',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		default: {},
		displayOptions: { show: { resource: ['message'], operation: ['sendTemplate'] } },
		description: 'Dynamic variables for the template. Name and index must match the template definition.',
		options: [
			{
				name: 'variable',
				displayName: 'Variable',
				values: [
					{
						displayName: 'Variable Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Variable name as defined in the template e.g. FirstName',
					},
					{
						displayName: 'Index',
						name: 'index',
						type: 'number',
						default: 1,
						description: 'Position of this variable in the template (1-based)',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to substitute into the template',
					},
				],
			},
		],
	},
	{
		displayName: 'Quick Reply Button Values',
		name: 'quickReplyButtonValues',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['message'], operation: ['sendTemplate'] } },
		description: 'JSON array of quick reply button payload values e.g. ["abc123"]',
	},

	// ── MESSAGE: Send Broadcast ───────────────────────────────────────────────
	phoneNumberIdField(['message'], ['sendBroadcast']),
	{
		displayName: 'Flow Data (JSON)',
		name: 'flowData',
		type: 'json',
		default: '{}',
		required: true,
		displayOptions: { show: { resource: ['message'], operation: ['sendBroadcast'] } },
		description: 'Broadcast flow data in JSON format',
	},

	// ── MESSAGE: Get Conversation ─────────────────────────────────────────────
	phoneNumberIdField(['message'], ['getConversation']),
	phoneNumberField(['message'], ['getConversation'], 'Subscriber phone number'),
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 10,
		required: true,
		displayOptions: { show: { resource: ['message'], operation: ['getConversation'] } },
		description: 'Number of messages to fetch',
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['message'], operation: ['getConversation'] } },
		description: 'Pagination offset',
	},

	// ── MESSAGE: Get Delivery Status ──────────────────────────────────────────
	{
		displayName: 'WhatsApp Message ID',
		name: 'waMessageId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['message'], operation: ['getStatus'] } },
		description: 'The wamid returned when the message was sent',
	},
	{
		displayName: 'WhatsApp Bot ID',
		name: 'whatsappBotId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['message'], operation: ['getStatus'] } },
		description: 'The numeric bot ID associated with the message',
	},

	// ── MESSAGE: Get PostBacks ────────────────────────────────────────────────
	phoneNumberIdField(['message'], ['getPostbacks']),

	// ── SUBSCRIBER: shared phoneNumberId + phoneNumber ────────────────────────
	phoneNumberIdField(
		['subscriber'],
		['get', 'delete', 'resetFlow', 'assignTeam', 'assignCustomFields',
		 'assignLabels', 'removeLabels', 'assignSequences', 'removeSequences', 'addNote', 'update'],
	),
	phoneNumberField(
		['subscriber'],
		['get', 'delete', 'resetFlow', 'assignTeam', 'assignCustomFields',
		 'assignLabels', 'removeLabels', 'assignSequences', 'removeSequences', 'addNote', 'update'],
	),

	// ── SUBSCRIBER: List ──────────────────────────────────────────────────────
	phoneNumberIdField(['subscriber'], ['list']),
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 10,
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['list'] } },
		description: 'Number of subscribers to return',
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['subscriber'], operation: ['list'] } },
		description: 'Pagination offset',
	},
	{
		displayName: 'Order By Recent Message',
		name: 'orderBy',
		type: 'boolean',
		default: false,
		displayOptions: { show: { resource: ['subscriber'], operation: ['list'] } },
		description: 'Whether to sort by most recent message first',
	},

	// ── SUBSCRIBER: Create ────────────────────────────────────────────────────
	{
		displayName: 'Phone Number ID',
		name: 'phoneNumberId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['create'] } },
		description: 'Your WhatsApp Business phone number ID',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['create'] } },
		description: "Subscriber's full name",
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['create'] } },
		description: 'Phone number with country code (no + sign)',
	},

	// ── SUBSCRIBER: Update extra fields ──────────────────────────────────────
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['subscriber'], operation: ['update'] } },
		options: [
			{ displayName: 'First Name', name: 'first_name', type: 'string', default: '' },
			{ displayName: 'Last Name',  name: 'last_name',  type: 'string', default: '' },
			{ displayName: 'Gender',     name: 'gender',     type: 'string', default: '' },
			{
				displayName: 'Label IDs',
				name: 'label_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated label IDs e.g. 1,4,5',
			},
		],
	},

	// ── SUBSCRIBER: Assign Team Member ────────────────────────────────────────
	{
		displayName: 'Team Member ID',
		name: 'teamMemberId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['assignTeam'] } },
		description: 'ID of the team member to assign the conversation to',
	},

	// ── SUBSCRIBER: Assign Custom Fields ─────────────────────────────────────
	{
		displayName: 'Custom Fields (JSON)',
		name: 'customFields',
		type: 'json',
		default: '{"field_name": "field_value"}',
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['assignCustomFields'] } },
		description: 'JSON object of custom field names and values',
	},

	// ── SUBSCRIBER: Labels / Sequences / Notes ────────────────────────────────
	{
		displayName: 'Label IDs',
		name: 'labelIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['assignLabels', 'removeLabels'] } },
		description: 'Comma-separated label IDs e.g. 1,4,5',
	},
	{
		displayName: 'Sequence IDs',
		name: 'sequenceIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['assignSequences', 'removeSequences'] } },
		description: 'Comma-separated sequence IDs e.g. 1,4,5',
	},
	{
		displayName: 'Note Text',
		name: 'noteText',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		required: true,
		displayOptions: { show: { resource: ['subscriber'], operation: ['addNote'] } },
		description: 'Note to add to the subscriber record',
	},

	// ── LABEL ─────────────────────────────────────────────────────────────────
	phoneNumberIdField(['label'], ['list', 'create']),
	{
		displayName: 'Label Name',
		name: 'labelName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['label'], operation: ['create'] } },
		description: 'Name for the new label',
	},

	// ── CATALOG ───────────────────────────────────────────────────────────────
	{
		displayName: 'Catalog ID',
		name: 'catalogId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['catalog'], operation: ['sync', 'listOrders'] } },
		description: 'WhatsApp catalog ID (required for Sync; optional for List Orders)',
	},
	{
		displayName: 'Order Unique ID',
		name: 'orderUniqueId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['catalog'], operation: ['updateOrder'] } },
		description: 'The unique order ID to update',
	},
	{
		displayName: 'Order Status',
		name: 'cartStatus',
		type: 'options',
		options: [
			{ name: 'Approved',  value: 'Approved'  },
			{ name: 'Completed', value: 'Completed' },
			{ name: 'Shipped',   value: 'Shipped'   },
			{ name: 'Delivered', value: 'Delivered' },
			{ name: 'Refunded',  value: 'Refunded'  },
		],
		default: 'Approved',
		required: true,
		displayOptions: { show: { resource: ['catalog'], operation: ['updateOrder'] } },
		description: 'New status for the order',
	},

	// ── BOT ───────────────────────────────────────────────────────────────────
	phoneNumberIdField(['bot'], ['triggerFlow', 'listTemplates']),
	{
		displayName: 'Bot Flow Unique ID',
		name: 'botFlowUniqueId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['bot'], operation: ['triggerFlow'] } },
		description: 'The unique ID of the bot flow to trigger',
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['bot'], operation: ['triggerFlow'] } },
		description: 'Recipient phone number with country code (numeric only)',
	},

	// ── ACCOUNT ───────────────────────────────────────────────────────────────
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'number',
		default: 0,
		required: true,
		displayOptions: { show: { resource: ['account'], operation: ['connect'] } },
		description: 'User ID of the WhatsApp account owner in GreenBubble',
	},
	{
		displayName: 'WhatsApp Business Account ID',
		name: 'whatsappBusinessAccountId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['account'], operation: ['connect'] } },
		description: 'Your WhatsApp Business Account ID (WABA ID)',
	},
	{
		displayName: 'Access Token',
		name: 'accessToken',
		type: 'string',
		typeOptions: { password: true },
		default: '',
		required: true,
		displayOptions: { show: { resource: ['account'], operation: ['connect'] } },
		description: 'Meta/Facebook access token for this WhatsApp Business Account',
	},

	// ── USER ──────────────────────────────────────────────────────────────────
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'user@example.com',
		default: '',
		required: true,
		displayOptions: { show: { resource: ['user'], operation: ['getLoginUrl'] } },
		description: "User's email address",
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['user'], operation: ['getLoginUrl'] } },
		options: [
			{ displayName: 'Name',         name: 'name',           type: 'string',  default: '' },
			{ displayName: 'Mobile',       name: 'mobile',         type: 'string',  default: '' },
			{ displayName: 'Package ID',   name: 'package_id',     type: 'number',  default: 0  },
			{ displayName: 'Expired Date', name: 'expired_date',   type: 'string',  default: '', description: 'Format: YYYY-MM-DD' },
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '1',
				options: [
					{ name: 'Active',   value: '1' },
					{ name: 'Inactive', value: '0' },
				],
			},
			{
				displayName: 'Create on Fail',
				name: 'create_on_fail',
				type: 'boolean',
				default: false,
				description: 'Whether to create a new user if not found',
			},
		],
	},
];
