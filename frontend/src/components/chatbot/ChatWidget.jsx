import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, RotateCcw, Bot } from "lucide-react";
import ChatMessageBubble from "./ChatMessageBubble";
import { useAuth } from "../../context/AuthContext";
import {
  getSessionId,
  resetSessionId,
  fetchSuggestions,
  fetchHistory,
  sendChatMessage,
  clearChatHistory,
} from "../../api/chatbot";

/**
 * "Smarty" — the floating customer help bot.
 *
 * Rendered once from DashboardLayout, so it follows the customer across every
 * page of the dashboard without each page having to know about it. It only
 * renders for a logged-in customer, since every endpoint it calls is
 * JWT-protected.
 */
export default function ChatWidget() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(getSessionId);
  const [messages, setMessages] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const loadedRef = useRef(false);

  // Load greeting + past conversation the first time the panel is opened.
  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      try {
        const [meta, history] = await Promise.all([
          fetchSuggestions(),
          fetchHistory(sessionId),
        ]);
        setGreeting(meta.greeting);
        setSuggestions(meta.suggestions || []);
        setMessages(history || []);
      } catch {
        setError("Couldn't start the assistant. Please try again.");
      }
    })();
  }, [open, sessionId]);

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Esc closes the panel.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending) return;

    setError("");
    setInput("");
    setMessages((prev) => [
      ...prev,
      { _id: `local-${Date.now()}`, role: "user", content: trimmed },
    ]);
    setSending(true);

    try {
      const data = await sendChatMessage(trimmed, sessionId);
      setMessages((prev) => [...prev, data.reply]);
    } catch (err) {
      setError(err?.response?.data?.message || "Message failed to send. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleReset = async () => {
    try {
      await clearChatHistory(sessionId);
    } catch {
      /* clearing is best-effort */
    }
    setSessionId(resetSessionId());
    setMessages([]);
    setError("");
  };

  if (!user) return null;

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close help assistant" : "Open help assistant"}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-maroon-600 hover:bg-maroon-700 text-parchment shadow-card flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 w-[min(24rem,calc(100vw-2.5rem))] h-[min(34rem,calc(100vh-9rem))] flex flex-col bg-parchment rounded-2xl border border-navy-800/10 shadow-card overflow-hidden">
          {/* header */}
          <header className="flex items-center justify-between gap-2 px-4 py-3 bg-navy-900 text-parchment">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <p className="font-display text-base leading-none">Smarty</p>
                <p className="text-[11px] uppercase tracking-widest text-navy-200">SmartBank help bot</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Start a new conversation"
                className="p-2 rounded-lg text-navy-200 hover:bg-white/10 hover:text-parchment transition-colors"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-2 rounded-lg text-navy-200 hover:bg-white/10 hover:text-parchment transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {greeting && (
              <ChatMessageBubble
                message={{ role: "bot", content: greeting, source: null }}
                onNavigate={() => setOpen(false)}
              />
            )}

            {messages.map((m) => (
              <ChatMessageBubble
                key={m._id}
                message={m}
                onNavigate={() => setOpen(false)}
              />
            ))}

            {sending && (
              <div className="flex items-center gap-2 text-navy-600/60 text-xs font-mono pl-9">
                <span className="h-1.5 w-1.5 rounded-full bg-navy-600/40 animate-pulse" />
                Smarty is typing…
              </div>
            )}

            {error && (
              <p className="text-xs text-maroon-700 bg-maroon-50 border border-maroon-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* starter chips, only while the conversation is empty */}
            {messages.length === 0 && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs text-navy-800 bg-white border border-navy-800/10 hover:border-maroon-600/40 hover:text-maroon-700 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* composer */}
          <div className="border-t border-navy-800/10 bg-white px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={1000}
                placeholder="Ask about your balance, loan, card…"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                className="flex-1 resize-none rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm max-h-28 focus:outline-none"
              />
              <button
                onClick={() => send()}
                disabled={sending || !input.trim()}
                aria-label="Send message"
                className="h-10 w-10 shrink-0 rounded-lg bg-maroon-600 hover:bg-maroon-700 text-parchment flex items-center justify-center transition-colors disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-navy-600/40 font-mono mt-1.5 text-center">
              Never share your password, CVV or OTP in chat.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
