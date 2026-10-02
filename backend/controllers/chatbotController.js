const crypto = require("crypto");
const ChatMessage = require("../models/ChatMessage");
const Faq = require("../models/Faq");
const { buildCustomerContext } = require("../utils/chatbot/buildContext");
const { buildSystemPrompt, matchRoute, DASHBOARD_MAP } = require("../utils/chatbot/knowledgeBase");
const { matchFaq } = require("../utils/chatbot/faqMatcher");
const { ruleAnswer } = require("../utils/chatbot/ruleEngine");
const { askLLM, isConfigured, PROVIDER } = require("../utils/chatbot/llmProvider");

const MAX_MESSAGE_LEN = 1000;
const HISTORY_TURNS = 10; // how many past messages are replayed to the LLM

// Very small in-memory rate limiter (per user, per minute) so a stuck client
// or a bored student cannot burn through the LLM quota.
const RATE_LIMIT = Number(process.env.CHATBOT_RATE_LIMIT || 20);
const hits = new Map();

function rateLimited(userId) {
  const now = Date.now();
  const key = String(userId);
  const entry = hits.get(key);
  if (!entry || now - entry.start > 60_000) {
    hits.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

/**
 * POST /api/chatbot/message   { message, sessionId? }
 *
 * Three-layer pipeline, cheapest first:
 *   1. ruleEngine  - questions about the customer's own data, answered from MongoDB
 *   2. FAQ matcher - curated answers matched by keyword index
 *   3. LLM         - Gemini/OpenAI, grounded with the dashboard map + masked customer context
 */
async function sendMessage(req, res) {
  const { message } = req.body;
  let { sessionId } = req.body;

  if (!message || !String(message).trim()) {
    return res.status(400).json({ message: "message is required" });
  }
  if (String(message).length > MAX_MESSAGE_LEN) {
    return res.status(400).json({ message: `Message too long (max ${MAX_MESSAGE_LEN} characters)` });
  }
  if (rateLimited(req.user._id)) {
    return res.status(429).json({ message: "You're sending messages a bit too fast. Give it a minute." });
  }

  const text = String(message).trim();
  sessionId = sessionId || crypto.randomUUID();

  // Persist the customer's turn first, so history survives a failed reply.
  await ChatMessage.create({
    user: req.user._id,
    sessionId,
    role: "user",
    content: text,
    source: "user",
  });

  const { snapshot, text: contextText } = await buildCustomerContext(req.user);

  let reply = null;

  // --- layer 1: deterministic rules over the customer's own records ---
  const ruled = ruleAnswer(text, snapshot);
  if (ruled) {
    reply = { ...ruled, source: "rule" };
  }

  // --- layer 2: curated FAQ knowledge base ---
  if (!reply) {
    const faqs = await Faq.find({ isActive: true }).lean();
    const hit = matchFaq(text, faqs);
    if (hit) {
      reply = {
        content: hit.faq.answer,
        intent: `faq:${hit.faq.category}`,
        action: hit.faq.route ? { label: hit.faq.actionLabel || "Open page", to: hit.faq.route } : null,
        source: "faq",
      };
    }
  }

  // --- layer 3: the LLM ---
  if (!reply) {
    try {
      const history = await ChatMessage.find({ user: req.user._id, sessionId })
        .sort({ createdAt: -1 })
        .limit(HISTORY_TURNS + 1)
        .lean();

      // drop the message we just saved, then put back in chronological order
      const priorTurns = history
        .filter((m) => m.content !== text || m.role !== "user")
        .reverse()
        .map((m) => ({ role: m.role, content: m.content }));

      const answer = await askLLM(buildSystemPrompt(contextText), priorTurns, text);
      reply = {
        content: answer,
        intent: "llm",
        action: matchRoute(text),
        source: "llm",
      };
    } catch (err) {
      console.error("[chatbot] LLM error:", err.message);
      reply = {
        content: isConfigured()
          ? "I'm having trouble reaching my language service right now. You can still ask me about your balance, transactions, loan, card or KYC status — or raise a ticket on the Support page."
          : "I can answer questions about your balance, transactions, loans, cards, KYC and how to use the dashboard. For anything else, please raise a ticket on the Support page.",
        intent: "fallback",
        action: matchRoute(text) || { label: "Open Support", to: "/support" },
        source: "fallback",
      };
    }
  }

  const saved = await ChatMessage.create({
    user: req.user._id,
    sessionId,
    role: "bot",
    content: reply.content,
    source: reply.source,
    intent: reply.intent,
    action: reply.action || undefined,
  });

  return res.status(201).json({
    sessionId,
    reply: {
      _id: saved._id,
      role: "bot",
      content: saved.content,
      source: saved.source,
      intent: saved.intent,
      action: reply.action || null,
      createdAt: saved.createdAt,
    },
  });
}

/** GET /api/chatbot/history?sessionId=... — replays a conversation */
async function getHistory(req, res) {
  const { sessionId } = req.query;
  const filter = { user: req.user._id };
  if (sessionId) filter.sessionId = sessionId;

  const messages = await ChatMessage.find(filter).sort({ createdAt: 1 }).limit(200).lean();
  return res.json({ messages });
}

/** DELETE /api/chatbot/history?sessionId=... — clears the conversation */
async function clearHistory(req, res) {
  const { sessionId } = req.query;
  const filter = { user: req.user._id };
  if (sessionId) filter.sessionId = sessionId;

  const result = await ChatMessage.deleteMany(filter);
  return res.json({ deleted: result.deletedCount });
}

/** GET /api/chatbot/suggestions — starter chips + a greeting for the widget */
async function getSuggestions(req, res) {
  const firstName = (req.user.fullName || "there").split(" ")[0];
  return res.json({
    greeting: `Hi ${firstName}, I'm Smarty. Ask me about your balance, a loan, your card, KYC — or where to find something on the dashboard.`,
    suggestions: [
      "What's my account balance?",
      "What's the status of my loan?",
      "How do I transfer money?",
      "How do I complete my KYC?",
      "How do I download my statement?",
      "I want to talk to a human",
    ],
    pages: DASHBOARD_MAP.map((p) => ({ label: p.label, route: p.route })),
    provider: isConfigured() ? PROVIDER : "offline",
  });
}

module.exports = { sendMessage, getHistory, clearHistory, getSuggestions };
