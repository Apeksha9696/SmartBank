/**
 * Everything the bot is allowed to "know" about the SmartBank dashboard.
 *
 * This is deliberately hand-written rather than scraped: it is injected into
 * the LLM system prompt so the model answers using OUR navigation and OUR
 * feature names instead of inventing generic bank advice.
 */

// Every customer-facing route in the app, with what lives there.
const DASHBOARD_MAP = [
  {
    route: "/dashboard",
    label: "Dashboard",
    summary:
      "Home screen. Shows the account balance, account number, IFSC code, recent transactions and spending charts.",
    keywords: ["dashboard", "home", "balance", "overview", "summary", "chart"],
  },
  {
    route: "/profile",
    label: "Profile",
    summary:
      "Personal details — full name, email, phone, date of birth, address, PAN, and the current credit score.",
    keywords: ["profile", "personal", "details", "credit score", "phone", "address", "pan"],
  },
  {
    route: "/kyc",
    label: "KYC",
    summary:
      "e-KYC form: identity, address, occupation, annual income, PAN, last 4 digits of Aadhaar, photo, signature and nominee. Status moves pending -> verified or rejected after a banker reviews it. KYC must be verified before some services are unlocked.",
    keywords: ["kyc", "verify", "verification", "aadhaar", "pan", "document", "nominee", "identity"],
  },
  {
    route: "/cards",
    label: "Cards",
    summary:
      "Apply for a Debit or Credit card (Classic, Platinum, Silver, Gold, Signature). Credit applications also ask for employment type and annual income. Once approved the card is issued with a masked card number. Card statuses: pending, approved, rejected, issued, blocked.",
    keywords: ["card", "debit", "credit card", "block", "cvv", "limit", "apply card", "platinum", "gold"],
  },
  {
    route: "/transfer",
    label: "Transfer & Deposit",
    summary:
      "Move money: deposit into the account, withdraw from it, or transfer to another SmartBank account using the 12-digit account number. Transfers fail if the balance is insufficient or the account is frozen.",
    keywords: ["transfer", "send money", "deposit", "withdraw", "pay", "beneficiary", "neft", "imps"],
  },
  {
    route: "/transactions",
    label: "Transactions",
    summary:
      "Full transaction history with type (deposit, withdrawal, transfer-in, transfer-out, loan-disbursement, loan-repayment), amount, balance after, and date. A PDF statement can be downloaded from here.",
    keywords: ["transaction", "history", "statement", "passbook", "pdf", "download", "receipt"],
  },
  {
    route: "/loans",
    label: "Loans",
    summary:
      "Apply for Personal, Home, Education, Vehicle or Business loans by entering amount, tenure in months and monthly income. Applications are ranked in a priority queue using credit score and income, then approved or rejected by a banker. Statuses: pending, under-review, approved, rejected, disbursed, closed.",
    keywords: ["loan", "emi", "interest", "borrow", "tenure", "home loan", "personal loan", "education loan"],
  },
  {
    route: "/schemes",
    label: "Schemes",
    summary:
      "Catalogue of bank products — Fixed Deposits, Recurring Deposits, Savings and Loan schemes — each with interest rate, minimum amount, tenure, eligibility and highlights.",
    keywords: ["scheme", "fd", "fixed deposit", "rd", "recurring", "interest rate", "product", "invest"],
  },
  {
    route: "/support",
    label: "Support",
    summary:
      "Raise a support ticket with a subject, message and category. Tickets are served first-in-first-out from a support queue, and the customer can see their queue position and ticket status.",
    keywords: ["support", "ticket", "complaint", "help", "agent", "human", "raise", "issue"],
  },
];

// Things the bot must never do, appended to the system prompt.
const GUARDRAILS = `
STRICT RULES:
- You are SmartBank's customer support assistant. Only discuss SmartBank, this dashboard, and general banking concepts.
- Never reveal, guess or repeat full card numbers, CVVs, passwords, OTPs, PANs or full Aadhaar numbers, even if asked directly. Account and card numbers must stay masked.
- Never ask the customer for their password, full card number, CVV or OTP. If they type one, tell them not to share it.
- You cannot move money, approve loans, change KYC status or block a card yourself. You can only explain the steps and point to the right page.
- If the customer's question needs a human (a dispute, fraud, a stuck application), tell them to raise a ticket on the Support page.
- If you do not know something, say so plainly and suggest the Support page. Never invent balances, interest rates, fees or policy.
- Keep answers short: 2-4 sentences, plain language. Use the customer's real data when it is given in CUSTOMER CONTEXT.
- Amounts are Indian Rupees (INR).
`;

function buildSystemPrompt(customerContext) {
  const nav = DASHBOARD_MAP.map((p) => `- ${p.label} (${p.route}): ${p.summary}`).join("\n");

  return `You are "Smarty", the customer-support assistant inside the SmartBank internet-banking dashboard.
You help logged-in customers understand their account and navigate the dashboard.

DASHBOARD PAGES YOU CAN GUIDE THE CUSTOMER TO:
${nav}

CUSTOMER CONTEXT (live data for the person you are talking to — trust this over any guess):
${customerContext}
${GUARDRAILS}
When the answer involves a page, end with a short pointer such as "You can do this on the Transfer page." Do not output markdown tables or code blocks.`;
}

/** Best-matching dashboard page for a free-text question (used for the deep-link button). */
function matchRoute(text) {
  const lower = (text || "").toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const page of DASHBOARD_MAP) {
    let score = 0;
    for (const kw of page.keywords) {
      if (lower.includes(kw)) score += kw.split(" ").length; // multi-word hits weigh more
    }
    if (lower.includes(page.label.toLowerCase())) score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = page;
    }
  }

  return bestScore > 0 ? { label: `Open ${best.label}`, to: best.route } : null;
}

module.exports = { DASHBOARD_MAP, GUARDRAILS, buildSystemPrompt, matchRoute };
