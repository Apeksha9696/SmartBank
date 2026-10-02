const mongoose = require("mongoose");

/**
 * Curated FAQ knowledge base. The chatbot checks these first (cheap, instant,
 * no API cost) before falling back to the LLM. `keywords` is what the
 * keyword-matcher scores against; `route` lets an answer deep-link the
 * customer straight to the right dashboard page.
 */
const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    keywords: [{ type: String, lowercase: true, trim: true }],
    category: {
      type: String,
      enum: ["Account", "Card", "Loan", "Transaction", "KYC", "Scheme", "Support", "Navigation", "Other"],
      default: "Other",
    },
    route: { type: String, default: "" }, // e.g. "/transfer"
    actionLabel: { type: String, default: "" }, // e.g. "Open Transfer"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Text index so Mongo itself can do a relevance search as a second pass.
faqSchema.index({ question: "text", answer: "text", keywords: "text" });

module.exports = mongoose.model("Faq", faqSchema);
