const mongoose = require("mongoose");

/**
 * One row per chat turn (both the customer's message and the bot's reply).
 * Scoped to a user + sessionId so a customer can have multiple independent
 * conversations, and so history can be replayed to the LLM for context.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sessionId: { type: String, required: true, index: true },

    role: { type: String, enum: ["user", "bot"], required: true },
    content: { type: String, required: true },

    // Where the bot's answer came from — useful for debugging and for the
    // little "answered from FAQ" badge in the UI.
    source: {
      type: String,
      enum: ["user", "faq", "llm", "rule", "fallback"],
      default: "user",
    },
    intent: { type: String, default: "" },

    // Optional deep-link the bot suggests, e.g. { label: "Open Transfer", to: "/transfer" }.
    action: {
      label: { type: String },
      to: { type: String },
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ user: 1, sessionId: 1, createdAt: 1 });

// Chat logs are support data, not financial records — expire them after 30
// days so the collection does not grow forever.
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
