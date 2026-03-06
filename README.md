# n8n-nodes-greenbubble

An n8n community node for [GreenBubble.io](https://www.greenbubble.io) — a WhatsApp Business automation and chatbot platform.

---

## Installation

In your n8n instance:

```
Settings → Community Nodes → Install → n8n-nodes-greenbubble
```

Or via npm in a self-hosted setup:

```bash
npm install n8n-nodes-greenbubble
```

---

## Credentials

Create a **GreenBubble API** credential with:
- **API Token** — found in your GreenBubble Developer Dashboard at `app.greenbubble.io/developer`
- **Base URL** — `https://app.greenbubble.io` (default, change only if self-hosted)

---

## Supported Resources & Operations

### 💬 Message
| Operation | Description |
|-----------|-------------|
| Send Text Message | Send a plain text WhatsApp message |
| Send Template Message | Send an approved template message with dynamic variables |
| Send Broadcast Template | Launch a broadcast campaign |
| Get Conversation | Fetch conversation history for a subscriber |
| Get Delivery Status | Check delivery/read status by message ID |
| Get PostBack List | List all post-back triggers for a phone number |

### 👤 Subscriber
| Operation | Description |
|-----------|-------------|
| Get Subscriber | Fetch subscriber by phone number |
| List Subscribers | Paginated list of all subscribers |
| Create Subscriber | Add a new contact |
| Update Subscriber | Edit subscriber name, gender, labels |
| Delete Subscriber | Remove a subscriber |
| Reset User Input Flow | Reset a bot conversation flow |
| Assign to Team Member | Route chat to a specific agent |
| Assign Custom Fields | Set custom field values |
| List Custom Fields | Get all configured custom fields |
| Assign Labels | Add labels to a subscriber |
| Remove Labels | Remove labels from a subscriber |
| Assign Sequences | Enrol subscriber in sequences |
| Remove Sequences | Remove subscriber from sequences |
| Add Note | Attach an internal note to a subscriber |

### 🏷️ Label
| Operation | Description |
|-----------|-------------|
| List Labels | Get all labels for a phone number |
| Create Label | Create a new label |

### 🛍️ Catalog
| Operation | Description |
|-----------|-------------|
| List Catalogs | Get all catalogs |
| Sync Catalog | Sync products from Meta catalog |
| List Orders | Get all catalog orders |
| Update Order Status | Change order status (Approved / Shipped / Delivered / etc.) |

### 🤖 Bot
| Operation | Description |
|-----------|-------------|
| Trigger Bot Flow | Send a bot flow to any number |
| List Bot Templates | Get all bot templates for an account |

### 🔗 Account
| Operation | Description |
|-----------|-------------|
| Connect Account | Connect a WhatsApp Business Account via API |

### 👥 User
| Operation | Description |
|-----------|-------------|
| Get Direct Login URL | Generate a one-time secure login URL for a sub-user |

---

## Development

```bash
npm install
npm run build
npm run dev   # watch mode
```

---

## Author

**Biswajit Pradhan**
- Email: [biswajit@greenbubble.io](mailto:biswajit@greenbubble.io)
- Website: [https://www.greenbubble.io](https://www.greenbubble.io)
- Company: Digital Domination Services LLC

---

## License

MIT
