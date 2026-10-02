require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Scheme = require("../models/Scheme");

const schemes = [
  {
    name: "SmartBank Regular Fixed Deposit",
    category: "Fixed Deposit",
    code: "FD-REG",
    description: "A standard fixed deposit with guaranteed returns, flexible tenure, and premature withdrawal support.",
    interestRate: "6.50% - 7.25% p.a.",
    minAmount: 1000,
    maxAmount: 10000000,
    tenure: "7 days - 10 years",
    eligibility: "Any resident individual with a SmartBank savings or current account.",
    highlights: [
      "Quarterly compounding",
      "Loan against FD up to 90% of deposit value",
      "Auto-renewal option",
    ],
  },
  {
    name: "SmartBank Senior Citizen FD",
    category: "Fixed Deposit",
    code: "FD-SENIOR",
    description: "Fixed deposit scheme offering an additional interest premium for senior citizens.",
    interestRate: "7.00% - 7.75% p.a.",
    minAmount: 5000,
    maxAmount: 10000000,
    tenure: "1 year - 10 years",
    eligibility: "Resident individuals aged 60 years and above.",
    highlights: ["Extra 0.50% over regular FD rate", "Monthly/quarterly interest payout option"],
  },
  {
    name: "SmartBank Tax Saver FD",
    category: "Fixed Deposit",
    code: "FD-TAXSAVER",
    description: "5-year lock-in fixed deposit eligible for tax deduction under Section 80C.",
    interestRate: "6.75% p.a.",
    minAmount: 1000,
    maxAmount: 150000,
    tenure: "5 years (fixed)",
    eligibility: "Resident individuals and HUFs.",
    highlights: ["Section 80C tax benefit", "No premature withdrawal before lock-in"],
  },
  {
    name: "SmartBank Recurring Deposit",
    category: "Recurring Deposit",
    code: "RD-STD",
    description: "Save a fixed amount every month and earn FD-equivalent interest, ideal for building disciplined savings.",
    interestRate: "6.25% - 7.00% p.a.",
    minAmount: 500,
    maxAmount: 200000,
    tenure: "6 months - 10 years",
    eligibility: "Any individual with a SmartBank savings account.",
    highlights: ["Auto-debit from linked savings account", "Flexible monthly instalment", "Loan against RD available"],
  },
  {
    name: "SmartBank Goal RD — Education & Travel",
    category: "Recurring Deposit",
    code: "RD-GOAL",
    description: "A goal-based recurring deposit with a built-in target tracker for education, travel, or big-ticket purchases.",
    interestRate: "6.50% p.a.",
    minAmount: 1000,
    maxAmount: 100000,
    tenure: "1 year - 5 years",
    eligibility: "Any individual, including minors through a guardian account.",
    highlights: ["Visual goal tracker", "Flexible top-up deposits", "Partial withdrawal on goal milestones"],
  },
  {
    name: "SmartBank Basic Savings Account",
    category: "Savings",
    code: "SAV-BASIC",
    description: "Zero-balance savings account with a free debit card and mobile banking access.",
    interestRate: "3.00% - 3.50% p.a.",
    minAmount: 0,
    tenure: "N/A",
    eligibility: "Any Indian resident aged 18 and above with valid KYC.",
    highlights: ["Zero minimum balance", "Free virtual debit card", "Free NEFT/IMPS transfers"],
  },
  {
    name: "SmartBank Premium Savings Account",
    category: "Savings",
    code: "SAV-PREMIUM",
    description: "A higher-interest savings account with premium benefits for balances above a threshold.",
    interestRate: "4.00% p.a.",
    minAmount: 25000,
    tenure: "N/A",
    eligibility: "Individuals maintaining an average monthly balance of ₹25,000+.",
    highlights: ["Higher interest slab", "Dedicated relationship support", "Fee waivers on demand drafts"],
  },
  {
    name: "SmartBank Personal Loan",
    category: "Loan",
    code: "LOAN-PERSONAL",
    description: "Unsecured loan for personal expenses, medical needs, weddings, or debt consolidation.",
    interestRate: "11.00% - 12.50% p.a.",
    minAmount: 25000,
    maxAmount: 2500000,
    tenure: "12 - 60 months",
    eligibility: "Salaried or self-employed individuals aged 21-58 with minimum credit score of 650.",
    highlights: ["No collateral required", "Disbursal within 48 hours of approval", "Prepayment allowed after 6 EMIs"],
  },
  {
    name: "SmartBank Home Loan",
    category: "Loan",
    code: "LOAN-HOME",
    description: "Long-tenure secured loan for purchase, construction, or renovation of residential property.",
    interestRate: "8.00% - 9.25% p.a.",
    minAmount: 500000,
    maxAmount: 50000000,
    tenure: "5 - 30 years",
    eligibility: "Indian residents aged 21-65 with stable income proof.",
    highlights: ["Up to 90% of property value financed", "Balance transfer facility", "Tax benefits under Section 80C & 24(b)"],
  },
  {
    name: "SmartBank Education Loan",
    category: "Loan",
    code: "LOAN-EDU",
    description: "Loan to fund higher education in India or abroad, covering tuition, hostel, and material costs.",
    interestRate: "9.00% - 10.50% p.a.",
    minAmount: 50000,
    maxAmount: 4000000,
    tenure: "5 - 15 years (including moratorium)",
    eligibility: "Indian students with confirmed admission; co-applicant required.",
    highlights: ["Moratorium until 1 year after course completion", "Interest subsidy for economically weaker sections", "Covers tuition, travel, and living costs"],
  },
  {
    name: "SmartBank Vehicle Loan",
    category: "Loan",
    code: "LOAN-VEHICLE",
    description: "Financing for new or used two-wheelers and four-wheelers.",
    interestRate: "9.25% - 10.75% p.a.",
    minAmount: 50000,
    maxAmount: 2000000,
    tenure: "12 - 84 months",
    eligibility: "Salaried or self-employed individuals aged 21-60.",
    highlights: ["Up to 90% on-road financing", "Quick approval for pre-approved customers", "Flexible EMI schedules"],
  },
  {
    name: "SmartBank Business Growth Loan",
    category: "Loan",
    code: "LOAN-BUSINESS",
    description: "Working capital and expansion financing for MSMEs and small business owners.",
    interestRate: "11.50% - 14.00% p.a.",
    minAmount: 100000,
    maxAmount: 10000000,
    tenure: "12 - 60 months",
    eligibility: "Business must be operational for 2+ years with audited financials.",
    highlights: ["Collateral-free up to ₹10 lakh under credit guarantee scheme", "Overdraft facility available", "GST-linked eligibility assessment"],
  },
];

async function seed() {
  await connectDB();
  for (const s of schemes) {
    await Scheme.findOneAndUpdate({ code: s.code }, s, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`Seeded ${schemes.length} schemes.`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
