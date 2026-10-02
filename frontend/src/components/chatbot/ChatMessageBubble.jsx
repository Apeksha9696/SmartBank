import React from "react";
import { Link } from "react-router-dom";
import { Bot, User, ArrowUpRight } from "lucide-react";

// Small badge showing which layer answered — handy during a demo/viva to prove
// the FAQ and rule layers are really running before the LLM is called.
const sourceLabel = {
  rule: "from your account",
  faq: "from FAQ",
  llm: "AI",
  fallback: "offline mode",
};

export default function ChatMessageBubble({ message, onNavigate }) {
  const isBot = message.role === "bot";

  return (
    <div className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="h-7 w-7 shrink-0 rounded-full bg-navy-900 text-gold-500 flex items-center justify-center">
          <Bot size={15} />
        </div>
      )}

      <div className={`max-w-[80%] ${isBot ? "" : "text-right"}`}>
        <div
          className={`inline-block text-left text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap ${
            isBot
              ? "bg-white border border-navy-800/10 text-navy-900 rounded-tl-sm shadow-sm"
              : "bg-maroon-600 text-parchment rounded-tr-sm"
          }`}
        >
          {message.content}
        </div>

        {isBot && message.action?.to && (
          <div>
            <Link
              to={message.action.to}
              onClick={onNavigate}
              className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-maroon-600 hover:text-maroon-700 border border-maroon-600/25 hover:border-maroon-600/50 rounded-full px-3 py-1 transition-colors"
            >
              {message.action.label}
              <ArrowUpRight size={12} />
            </Link>
          </div>
        )}

        {isBot && sourceLabel[message.source] && (
          <p className="text-[10px] uppercase tracking-wide text-navy-600/40 font-mono mt-1">
            {sourceLabel[message.source]}
          </p>
        )}
      </div>

      {!isBot && (
        <div className="h-7 w-7 shrink-0 rounded-full bg-navy-50 text-navy-600 flex items-center justify-center">
          <User size={15} />
        </div>
      )}
    </div>
  );
}
