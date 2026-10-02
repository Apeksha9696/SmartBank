const { AccountHashMap } = require("../dsa/HashMap");

/**
 * Keyword-based FAQ retrieval, layer 1 of the chatbot.
 *
 * An inverted index (keyword -> list of FAQs) is built once per request batch
 * inside the project's existing HashMap util, giving O(1) average lookup per
 * token instead of re-scanning every FAQ. Matching a stored FAQ is instant,
 * free, and deterministic — the LLM is only called when this misses.
 */

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "how", "what", "why",
  "when", "where", "can", "i", "my", "me", "to", "for", "of", "in", "on", "at", "and", "or",
  "it", "this", "that", "you", "your", "please", "tell", "show", "want", "need", "get", "with",
  "from", "about", "smartbank", "bank", "there", "have", "has", "will", "would", "should",
]);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Build keyword -> [{ faq, weight }] index inside the project's HashMap.
 * A term that the FAQ author listed explicitly in `keywords` is a much
 * stronger signal than a word that merely happens to appear in the question
 * text, so it carries twice the weight.
 */
function buildIndex(faqs) {
  const index = new AccountHashMap();

  const add = (term, faq, weight) => {
    const key = String(term).toLowerCase();
    const bucket = index.get(key) || [];
    const existing = bucket.find((e) => String(e.faq._id) === String(faq._id));
    if (existing) existing.weight = Math.max(existing.weight, weight);
    else bucket.push({ faq, weight });
    index.set(key, bucket);
  };

  faqs.forEach((faq) => {
    // single-word curated keywords
    (faq.keywords || []).forEach((kw) => {
      String(kw)
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w))
        .forEach((w) => add(w, faq, 2));
    });
    // words from the FAQ question itself
    tokenize(faq.question).forEach((w) => add(w, faq, 1));
  });

  return index;
}

/**
 * Score every candidate FAQ against the question and return the best one.
 * Returns null when nothing clears the confidence threshold, which is the
 * signal for the controller to escalate to the LLM.
 */
function matchFaq(question, faqs, { threshold = 2 } = {}) {
  if (!faqs.length) return null;

  const index = buildIndex(faqs);
  const tokens = tokenize(question);
  const lower = (question || "").toLowerCase();
  const scores = new Map();

  const bump = (faq, points) => {
    const id = String(faq._id);
    scores.set(id, { faq, score: (scores.get(id)?.score || 0) + points });
  };

  // 1. token hits via the inverted index
  tokens.forEach((token) => {
    (index.get(token) || []).forEach(({ faq, weight }) => bump(faq, weight));
  });

  // 2. exact multi-word keyword phrases score higher than loose tokens
  faqs.forEach((faq) => {
    (faq.keywords || []).forEach((kw) => {
      if (kw.includes(" ") && lower.includes(kw)) bump(faq, 3);
    });
  });

  let best = null;
  scores.forEach((entry) => {
    if (!best || entry.score > best.score) best = entry;
  });

  if (!best || best.score < threshold) return null;
  return { faq: best.faq, score: best.score };
}

module.exports = { matchFaq, buildIndex, tokenize };
