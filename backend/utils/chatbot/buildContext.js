const Account = require("../../models/Account");
const Transaction = require("../../models/Transaction");
const Loan = require("../../models/Loan");
const Card = require("../../models/Card");
const Kyc = require("../../models/Kyc");
const SupportTicket = require("../../models/SupportTicket");

/**
 * Reads the logged-in customer's real records and returns:
 *   snapshot - a structured object the offline rule-engine answers from
 *   text     - the same thing flattened into the plain-text block that gets
 *              injected into the LLM system prompt
 *
 * This is what lets the bot answer "what's my balance?" or "did my loan get
 * approved?" truthfully instead of hallucinating.
 *
 * Nothing sensitive leaves the server: full account numbers, full card
 * numbers, CVVs, PAN and Aadhaar are never included.
 */

function maskAccount(num) {
  return num ? `XXXX XXXX ${String(num).slice(-4)}` : "not available";
}

function inr(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

async function buildCustomerSnapshot(user) {
  const account = await Account.findOne({ user: user._id }).lean();

  const transactions = account
    ? await Transaction.find({ account: account._id }).sort({ createdAt: -1 }).limit(5).lean()
    : [];

  const [loans, cards, kyc, tickets] = await Promise.all([
    Loan.find({ user: user._id }).sort({ createdAt: -1 }).limit(3).lean(),
    Card.find({ user: user._id }).sort({ createdAt: -1 }).limit(3).lean(),
    Kyc.findOne({ user: user._id }).select("status remarks updatedAt").lean(),
    SupportTicket.find({ user: user._id }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  return {
    user: {
      fullName: user.fullName,
      creditScore: user.creditScore,
      kycVerified: user.kycVerified,
    },
    account,
    transactions,
    loans,
    cards,
    kyc,
    tickets,
  };
}

function snapshotToText(s) {
  const lines = [];

  lines.push(`Name: ${s.user.fullName}`);
  lines.push(`Credit score: ${s.user.creditScore}`);
  lines.push(`KYC verified on profile: ${s.user.kycVerified ? "yes" : "no"}`);

  if (s.account) {
    lines.push(
      `Account: ${maskAccount(s.account.accountNumber)} (${s.account.accountType}), status ${s.account.status}, IFSC ${s.account.ifscCode}`
    );
    lines.push(`Current balance: ${inr(s.account.balance)}`);
  } else {
    lines.push("Account: no account record found");
  }

  if (s.transactions.length) {
    lines.push("Last 5 transactions:");
    s.transactions.forEach((t) => {
      const when = new Date(t.createdAt).toLocaleDateString("en-IN");
      lines.push(`  - ${when}: ${t.type} ${inr(t.amount)} (balance after ${inr(t.balanceAfter)})`);
    });
  } else {
    lines.push("Last 5 transactions: none yet");
  }

  lines.push(
    s.loans.length
      ? `Loans: ${s.loans
          .map(
            (l) =>
              `${l.loanType} ${inr(l.amountRequested)} for ${l.tenureMonths} months at ${l.interestRate}% - ${l.status}`
          )
          .join("; ")}`
      : "Loans: no loan applications"
  );

  lines.push(
    s.cards.length
      ? `Cards: ${s.cards
          .map((c) => {
            const last4 = c.cardNumber ? `ending ${c.cardNumber.slice(-4)}` : "not issued yet";
            return `${c.variant} ${c.cardCategory} (${last4}) - ${c.status}`;
          })
          .join("; ")}`
      : "Cards: no cards applied for"
  );

  lines.push(
    s.kyc
      ? `KYC submission: ${s.kyc.status}${s.kyc.remarks ? ` (banker remark: ${s.kyc.remarks})` : ""}`
      : "KYC submission: not submitted yet"
  );

  lines.push(
    s.tickets.length
      ? `Support tickets: ${s.tickets.map((t) => `"${t.subject}" [${t.category}] - ${t.status}`).join("; ")}`
      : "Support tickets: none"
  );

  return lines.join("\n");
}

async function buildCustomerContext(user) {
  const snapshot = await buildCustomerSnapshot(user);
  return { snapshot, text: snapshotToText(snapshot) };
}

module.exports = { buildCustomerContext, buildCustomerSnapshot, snapshotToText, maskAccount, inr };
