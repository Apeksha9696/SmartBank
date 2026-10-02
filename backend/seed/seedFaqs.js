require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Faq = require("../models/Faq");

// Curated answers the chatbot serves before it ever calls the LLM.
// Run with:  npm run seed:faqs
const faqs = [
  {
    question: "How do I transfer money to another account?",
    answer:
      "Open the Transfer & Deposit page, choose Transfer, enter the recipient's 12-digit SmartBank account number and the amount, then confirm. The transfer fails if your balance is short or either account is frozen, and both sides get a transaction entry immediately.",
    keywords: ["transfer", "send money", "transfer money", "pay someone", "beneficiary", "another account"],
    category: "Transaction",
    route: "/transfer",
    actionLabel: "Open Transfer",
  },
  {
    question: "How do I deposit or withdraw money?",
    answer:
      "Both are on the Transfer & Deposit page. Pick Deposit or Withdraw, enter the amount and confirm — your balance and transaction history update straight away.",
    keywords: ["deposit", "withdraw", "withdrawal", "add money", "cash out"],
    category: "Transaction",
    route: "/transfer",
    actionLabel: "Open Transfer",
  },
  {
    question: "How do I download my account statement?",
    answer:
      "Go to the Transactions page and use the download option — it generates a PDF statement of your transaction history that you can save or print.",
    keywords: ["statement", "download statement", "pdf", "passbook", "bank statement", "export"],
    category: "Transaction",
    route: "/transactions",
    actionLabel: "Open Transactions",
  },
  {
    question: "How do I complete my KYC?",
    answer:
      "Open the KYC page and fill in your identity and address details, occupation, annual income, PAN, the last 4 digits of your Aadhaar, plus a photo and signature. Submit it and a banker reviews it — the status moves from pending to verified or rejected. Only the last 4 Aadhaar digits are ever stored.",
    keywords: ["kyc", "verification", "verify account", "aadhaar", "pan card", "documents", "nominee"],
    category: "KYC",
    route: "/kyc",
    actionLabel: "Open KYC",
  },
  {
    question: "How do I apply for a debit or credit card?",
    answer:
      "On the Cards page, choose Debit or Credit and pick a variant (Classic, Platinum, Silver, Gold or Signature). Credit applications also ask for your employment type and annual income. Once a banker approves it, the card is issued and shown with a masked number.",
    keywords: ["apply card", "new card", "debit card", "credit card", "card variant", "platinum", "signature"],
    category: "Card",
    route: "/cards",
    actionLabel: "Open Cards",
  },
  {
    question: "My card is lost. How do I block it?",
    answer:
      "For anything urgent like a lost or stolen card, raise a ticket on the Support page right away with the card type and last 4 digits — a banker can move it to blocked. Never share the full card number or CVV with anyone, including me.",
    keywords: ["block card", "lost card", "stolen card", "card fraud", "freeze card", "unauthorised"],
    category: "Card",
    route: "/support",
    actionLabel: "Open Support",
  },
  {
    question: "How do I apply for a loan?",
    answer:
      "Go to the Loans page, pick the loan type (Personal, Home, Education, Vehicle or Business), then enter the amount, tenure in months and your monthly income. Your application is ranked in a priority queue using your credit score and income before a banker approves or rejects it.",
    keywords: ["apply loan", "loan application", "borrow money", "home loan", "personal loan", "education loan", "vehicle loan"],
    category: "Loan",
    route: "/loans",
    actionLabel: "Open Loans",
  },
  {
    question: "How is my loan interest rate decided?",
    answer:
      "The rate is calculated when you apply, from the loan type, the tenure you choose, your monthly income and your credit score. A higher credit score generally means a lower rate and a better position in the approval queue.",
    keywords: ["interest rate", "loan rate", "emi", "how much interest", "rate decided"],
    category: "Loan",
    route: "/loans",
    actionLabel: "Open Loans",
  },
  {
    question: "How long does loan approval take?",
    answer:
      "Applications sit in a priority queue and are reviewed by a banker, so the wait depends on where yours ranks. You can check the live status — pending, under-review, approved, rejected, disbursed or closed — on the Loans page at any time.",
    keywords: ["loan approval", "how long", "approval time", "pending loan", "under review"],
    category: "Loan",
    route: "/loans",
    actionLabel: "Open Loans",
  },
  {
    question: "What schemes does SmartBank offer?",
    answer:
      "The Schemes page lists every product — Fixed Deposits, Recurring Deposits, Savings and Loan schemes — with the interest rate, minimum amount, tenure, eligibility and highlights for each one.",
    keywords: ["scheme", "fixed deposit", "recurring deposit", "invest", "products", "offers", "savings scheme"],
    category: "Scheme",
    route: "/schemes",
    actionLabel: "Open Schemes",
  },
  {
    question: "How do I raise a support ticket?",
    answer:
      "On the Support page, choose a category (Account, Card, Loan, Transaction or Other), add a subject and a description, and submit. Tickets are served first-in-first-out, and you'll see your queue position and status.",
    keywords: ["support ticket", "raise ticket", "complaint", "report issue", "contact support", "queue position"],
    category: "Support",
    route: "/support",
    actionLabel: "Open Support",
  },
  {
    question: "How do I change my profile details?",
    answer:
      "Your name, email, phone, date of birth, address, PAN and credit score all live on the Profile page. Some fields are locked after KYC verification — if you need one of those changed, raise a support ticket.",
    keywords: ["profile", "change details", "update phone", "update address", "edit profile", "personal details"],
    category: "Account",
    route: "/profile",
    actionLabel: "Open Profile",
  },
  {
    question: "I forgot my password. What do I do?",
    answer:
      "Sign out and use the 'Forgot password' link on the login page. You'll get a reset link by email that's valid for a limited time — open it and set a new password. I can never see or reset your password myself.",
    keywords: ["forgot password", "reset password", "change password", "cannot login", "locked out"],
    category: "Account",
    route: "/profile",
    actionLabel: "Open Profile",
  },
  {
    question: "What is my account number and IFSC code?",
    answer:
      "Your 12-digit account number and IFSC code are shown on the Dashboard. For safety I'll only ever tell you the last 4 digits in chat.",
    keywords: ["account number", "ifsc", "ifsc code", "account details", "branch code"],
    category: "Account",
    route: "/dashboard",
    actionLabel: "Open Dashboard",
  },
  {
    question: "Why is my account frozen?",
    answer:
      "An account can be marked frozen while a review is in progress, which blocks transfers and withdrawals. The exact reason has to come from a banker, so raise a ticket on the Support page and they'll take a look.",
    keywords: ["frozen", "account blocked", "cannot transfer", "account inactive", "account closed"],
    category: "Account",
    route: "/support",
    actionLabel: "Open Support",
  },
  {
    question: "What can this dashboard do?",
    answer:
      "The sidebar covers everything: Dashboard for your balance and charts, Profile for personal details, KYC for verification, Cards to apply and manage cards, Transfer & Deposit to move money, Transactions for history and statements, Loans to apply and track, Schemes for deposit products, and Support for tickets.",
    keywords: ["dashboard", "what can you do", "features", "menu", "navigate", "sidebar", "help me"],
    category: "Navigation",
    route: "/dashboard",
    actionLabel: "Open Dashboard",
  },
];

async function run() {
  await connectDB();
  await Faq.deleteMany({});
  await Faq.insertMany(faqs);
  console.log(`Seeded ${faqs.length} chatbot FAQs.`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("FAQ seed failed:", err.message);
  process.exit(1);
});
