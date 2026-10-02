const { maskAccount, inr } = require("./buildContext");
const { matchRoute } = require("./knowledgeBase");

/**
 * Layer 2 of the chatbot: deterministic answers for questions about the
 * customer's OWN data (balance, last transaction, loan/card/KYC status).
 *
 * These are answered straight from MongoDB rather than the LLM because they
 * must never be approximated — a hallucinated balance would be worse than no
 * answer. It also means the whole assistant still works during a demo with no
 * API key configured.
 */

const has = (text, ...words) => words.some((w) => text.includes(w));

function ruleAnswer(question, snapshot) {
  const q = (question || "").toLowerCase();
  const { account, transactions, loans, cards, kyc, tickets, user } = snapshot;

  // --- safety: someone pasting a secret into the chat ---
  if (/\b\d{12,16}\b/.test(q) || has(q, "my password", "my cvv", "my otp")) {
    return {
      content:
        "Please don't share full card numbers, passwords, CVVs or OTPs here — not with me and not with anyone claiming to be from SmartBank. I can help without them.",
      intent: "security_warning",
      action: null,
    };
  }

  // --- balance ---
  if (has(q, "balance", "how much money", "funds available", "available amount")) {
    if (!account) return { content: "I couldn't find an account linked to your profile. Please raise a ticket on the Support page.", intent: "balance", action: { label: "Open Support", to: "/support" } };
    return {
      content: `Your ${account.accountType} account ${maskAccount(account.accountNumber)} has a balance of ${inr(account.balance)}. The account is currently ${account.status}.`,
      intent: "balance",
      action: { label: "Open Dashboard", to: "/dashboard" },
    };
  }

  // --- account number / IFSC ---
  if (has(q, "account number", "ifsc", "account details")) {
    if (!account) return null;
    return {
      content: `Your account number ends in ${String(account.accountNumber).slice(-4)} and the IFSC code is ${account.ifscCode}. For security I only show the last 4 digits here — the full number is on your Dashboard.`,
      intent: "account_details",
      action: { label: "Open Dashboard", to: "/dashboard" },
    };
  }

  // --- last transaction ---
  if (has(q, "last transaction", "recent transaction", "last payment", "recent activity", "mini statement")) {
    if (!transactions.length) {
      return { content: "There are no transactions on your account yet. Once you deposit or transfer money it'll show up here.", intent: "transactions", action: { label: "Open Transfer", to: "/transfer" } };
    }
    const t = transactions[0];
    const when = new Date(t.createdAt).toLocaleDateString("en-IN");
    return {
      content: `Your most recent transaction was a ${t.type} of ${inr(t.amount)} on ${when}, leaving a balance of ${inr(t.balanceAfter)}. The full history and a PDF statement are on the Transactions page.`,
      intent: "transactions",
      action: { label: "Open Transactions", to: "/transactions" },
    };
  }

  // --- loan status ---
  if (has(q, "loan status", "my loan", "loan approved", "loan application", "loan rejected")) {
    if (!loans.length) {
      return { content: "You don't have any loan applications yet. You can apply for a Personal, Home, Education, Vehicle or Business loan from the Loans page.", intent: "loan_status", action: { label: "Open Loans", to: "/loans" } };
    }
    const l = loans[0];
    return {
      content: `Your latest application is a ${l.loanType} loan of ${inr(l.amountRequested)} over ${l.tenureMonths} months at ${l.interestRate}% p.a., currently "${l.status}".${l.remarks ? ` Banker remark: ${l.remarks}.` : ""}`,
      intent: "loan_status",
      action: { label: "Open Loans", to: "/loans" },
    };
  }

  // --- card status ---
  if (has(q, "card status", "my card", "card approved", "card application", "when will i get my card")) {
    if (!cards.length) {
      return { content: "You haven't applied for a card yet. You can apply for a Debit or Credit card from the Cards page.", intent: "card_status", action: { label: "Open Cards", to: "/cards" } };
    }
    const c = cards[0];
    const num = c.cardNumber ? ` ending ${c.cardNumber.slice(-4)}` : "";
    return {
      content: `Your ${c.variant} ${c.cardCategory} card${num} is currently "${c.status}".${c.status === "pending" ? " A banker still has to review it." : ""}`,
      intent: "card_status",
      action: { label: "Open Cards", to: "/cards" },
    };
  }

  // --- KYC status ---
  if (has(q, "kyc")) {
    if (!kyc) {
      return { content: "You haven't submitted your KYC yet. The form needs your identity and address details, PAN, last 4 digits of Aadhaar, a photo and your signature.", intent: "kyc_status", action: { label: "Open KYC", to: "/kyc" } };
    }
    return {
      content: `Your KYC submission is currently "${kyc.status}".${kyc.remarks ? ` Banker remark: ${kyc.remarks}.` : ""}${kyc.status === "pending" ? " A banker usually reviews it within a couple of working days." : ""}`,
      intent: "kyc_status",
      action: { label: "Open KYC", to: "/kyc" },
    };
  }

  // --- credit score ---
  if (has(q, "credit score", "cibil")) {
    return {
      content: `Your credit score is ${user.creditScore}. It's one of the inputs used to rank your loan application in the approval queue and to set your interest rate.`,
      intent: "credit_score",
      action: { label: "Open Profile", to: "/profile" },
    };
  }

  // --- ticket status ---
  if (has(q, "my ticket", "ticket status", "my complaint")) {
    if (!tickets.length) {
      return { content: "You don't have any support tickets open. If something needs a human, you can raise one from the Support page.", intent: "ticket_status", action: { label: "Open Support", to: "/support" } };
    }
    const t = tickets[0];
    return {
      content: `Your latest ticket "${t.subject}" (${t.category}) is "${t.status}". Tickets are handled in the order they arrive.`,
      intent: "ticket_status",
      action: { label: "Open Support", to: "/support" },
    };
  }

  // --- talk to a human ---
  if (has(q, "human", "agent", "real person", "customer care", "speak to someone")) {
    return {
      content: "I can hand this to a person — raise a ticket on the Support page and it joins the queue for a banker. Include as much detail as you can so they don't have to ask twice.",
      intent: "escalate",
      action: { label: "Open Support", to: "/support" },
    };
  }

  // --- pure navigation ("where do I ...", "take me to ...") ---
  if (has(q, "where do i", "where can i", "take me to", "how do i find", "navigate", "which page")) {
    const route = matchRoute(q);
    if (route) {
      return {
        content: `That's on the ${route.label.replace("Open ", "")} page — use the button below or the left sidebar.`,
        intent: "navigation",
        action: route,
      };
    }
  }

  return null; // nothing matched -> escalate to FAQ / LLM
}

module.exports = { ruleAnswer };
