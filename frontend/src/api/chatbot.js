import api from "./axios";

/**
 * Chatbot API helpers. These go through the shared axios instance, so the
 * JWT in localStorage is attached automatically by its request interceptor —
 * the backend uses that token to decide whose balance/loans/cards to answer about.
 */

const SESSION_KEY = "smartbank_chat_session";

/** One conversation per browser, reused across page navigations and reloads. */
export function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function resetSessionId() {
  localStorage.removeItem(SESSION_KEY);
  return getSessionId();
}

export async function fetchSuggestions() {
  const { data } = await api.get("/chatbot/suggestions");
  return data;
}

export async function fetchHistory(sessionId) {
  const { data } = await api.get("/chatbot/history", { params: { sessionId } });
  return data.messages;
}

export async function sendChatMessage(message, sessionId) {
  const { data } = await api.post("/chatbot/message", { message, sessionId });
  return data;
}

export async function clearChatHistory(sessionId) {
  const { data } = await api.delete("/chatbot/history", { params: { sessionId } });
  return data;
}
