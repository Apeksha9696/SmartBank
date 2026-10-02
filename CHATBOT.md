# Smarty — SmartBank Customer Help Bot

A floating AI assistant for logged-in customers. It answers questions about
their own account and guides them around the dashboard.

## Setup

```bash
# backend
cd backend
npm run seed:faqs        # loads the FAQ knowledge base into MongoDB
npm run dev

# frontend
cd frontend
npm run dev
```

Add to `backend/.env`:

```
CHATBOT_PROVIDER=gemini          # gemini | openai | off
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
CHATBOT_TIMEOUT_MS=15000
CHATBOT_RATE_LIMIT=20            # messages per user per minute
```

Get a Gemini key from https://aistudio.google.com/apikey.
To use OpenAI instead, set `CHATBOT_PROVIDER=openai` and `OPENAI_API_KEY`.

**With no key set the bot still works** — it falls back to the rule engine and
the seeded FAQs. Useful for demos without internet.

## How a message is answered

Each message walks three layers, cheapest first, and stops at the first hit:

| Layer | Handles | Cost |
|---|---|---|
| 1. Rule engine | "What's my balance?", loan/card/KYC status — read straight from MongoDB | free, instant, never wrong |
| 2. FAQ matcher | "How do I apply for a loan?" — keyword index over seeded FAQs | free, instant |
| 3. LLM | anything else — Gemini/OpenAI, grounded with the dashboard map + masked customer context | API call |

If the LLM errors or is not configured, a safe fallback reply is returned.

## Files added

**Backend**
```
models/ChatMessage.js                 conversation storage (30-day TTL)
models/Faq.js                         FAQ knowledge base
seed/seedFaqs.js                      16 seeded FAQs — `npm run seed:faqs`
utils/chatbot/knowledgeBase.js        dashboard map + system prompt + guardrails
utils/chatbot/buildContext.js         masked per-customer data snapshot
utils/chatbot/faqMatcher.js           keyword index (uses utils/dsa/HashMap)
utils/chatbot/ruleEngine.js           deterministic answers from MongoDB
utils/chatbot/llmProvider.js          Gemini / OpenAI wrapper
controllers/chatbotController.js      the 3-layer pipeline
routes/chatbotRoutes.js               /api/chatbot/*, JWT-protected
```

**Frontend**
```
api/chatbot.js                        API helpers + session id
components/chatbot/ChatWidget.jsx     floating launcher + chat panel
components/chatbot/ChatMessageBubble.jsx   message bubble + deep-link button
```

**Modified**
```
backend/server.js                     mounts /api/chatbot
backend/package.json                  adds "seed:faqs" script
backend/.env / .env.example           chatbot config
frontend/src/components/DashboardLayout.jsx   renders <ChatWidget />
```

## API

All endpoints require `Authorization: Bearer <jwt>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/chatbot/message` | send a message, get a reply |
| GET | `/api/chatbot/history?sessionId=` | replay a conversation |
| DELETE | `/api/chatbot/history?sessionId=` | clear a conversation |
| GET | `/api/chatbot/suggestions` | greeting + starter chips |

## Security

- Every endpoint is behind the existing `protect` JWT middleware. The bot only
  ever reads the records belonging to `req.user._id`.
- Account and card numbers are masked to the last 4 digits before they reach
  the prompt. CVVs, passwords, PAN and full Aadhaar are never included.
- The system prompt forbids revealing secrets or performing actions.
- If a customer pastes a card number, the bot warns them instead of using it.
- Per-user rate limit of 20 messages/minute.
- The bot cannot move money or change any status — it only explains and links.
