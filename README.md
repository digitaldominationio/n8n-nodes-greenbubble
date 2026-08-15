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
- **API Key** — found in your GreenBubble Developer Dashboard at `app.greenbubble.io/developer`
- **Base URL** — `https://api.greenbubble.io` (default, change only if self-hosted)

The API key is sent as an `x-api-key` header and is bound to a workspace automatically.

---

## Supported Resources & Operations

### 📡 Sender
| Operation | Description |
|-----------|-------------|
| List Senders | List every active WhatsApp sender (Cloud API / Scan Device) in a workspace and copy a `sender_id` |

### 💬 Message
| Operation | Description |
|-----------|-------------|
| Send Text | Send a free-form text message |
| Send Template | Send a Meta-approved template with body variables and header media |
| Send Image | Send an image via public URL |
| Send Video | Send a video via public URL |
| Send Audio | Send an audio file via public URL |
| Send Document | Send a document (PDF, etc.) via public URL |
| Send Location | Send a location pin with latitude/longitude |
| Send Reaction | React to a message with an emoji |

### 👥 Group
| Operation | Description |
|-----------|-------------|
| List Groups | List joined WhatsApp groups for a Scan Device sender |
| List Group Members | List members of a joined group |
| Send Group Message | Send a text message to a group by ID or name |

### 📨 Template
| Operation | Description |
|-----------|-------------|
| Create Template | Create a Meta message template for approval |

### 📢 Campaign
| Operation | Description |
|-----------|-------------|
| Create Campaign | Create a broadcast template campaign |
| List Campaigns | List broadcast campaigns |

### 📇 Contact
| Operation | Description |
|-----------|-------------|
| Create Contact | Create a new contact |
| List Contacts | List all contacts |

---

## Usage

### Send a text message

1. Open an n8n workflow and add the **GreenBubble** node (search for "GreenBubble" in the node panel).
2. Set the node's credentials to a **GreenBubble API** credential (see [Credentials](#credentials)).
3. In the node's parameters, set **Resource** to `Message`.
4. Set **Operation** to `Send Text`.
5. Fill in:
   - **Sender ID** — copy a sender's `wa_snd_…` ID by running a `Sender → List Senders` node first, or paste one you already have.
   - **To** — the recipient's WhatsApp number with country code, digits only (no `+`). Example: `919876543210`.
   - **Message Body** — the text to send.
6. Run the workflow. The node returns the GreenBubble API response, including the sent message ID.

> Tip: pair it with a **Sender → List Senders** node and reference its output with an expression, e.g. `{{ $json.id }}`, so you don't have to hard-code sender IDs.

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
