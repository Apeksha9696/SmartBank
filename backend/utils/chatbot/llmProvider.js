/**
 * Thin LLM wrapper. Supports Gemini and OpenAI behind one function so the
 * controller does not care which provider is configured.
 *
 * Uses the global `fetch` built into Node 18+, so there is NO new npm
 * dependency to install for this feature.
 *
 * Provider is chosen by CHATBOT_PROVIDER in .env ("gemini" | "openai" | "off").
 * If no key is configured the caller falls back to the FAQ/rule engine, so
 * the chatbot still works offline for demos.
 */

const PROVIDER = (process.env.CHATBOT_PROVIDER || "gemini").toLowerCase();
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const TIMEOUT_MS = Number(process.env.CHATBOT_TIMEOUT_MS || 15000);

function isConfigured() {
  if (PROVIDER === "off") return false;
  if (PROVIDER === "openai") return Boolean(OPENAI_KEY);
  return Boolean(GEMINI_KEY);
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {string} systemPrompt
 * @param {Array<{role: "user"|"bot", content: string}>} history  oldest -> newest
 * @param {string} message  the new customer message
 * @returns {Promise<string>} the assistant's reply text
 */
async function askLLM(systemPrompt, history, message) {
  if (!isConfigured()) throw new Error("LLM not configured");
  return PROVIDER === "openai"
    ? askOpenAI(systemPrompt, history, message)
    : askGemini(systemPrompt, history, message);
}

async function askGemini(systemPrompt, history, message) {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "bot" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const res = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

async function askOpenAI(systemPrompt, history, message) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.content })),
    { role: "user", content: message },
  ];

  const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: OPENAI_MODEL, messages, temperature: 0.3, max_tokens: 400 }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}

module.exports = { askLLM, isConfigured, PROVIDER };
