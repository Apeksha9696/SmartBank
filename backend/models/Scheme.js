const mongoose = require("mongoose");

// Bank "schemes" — the fixed/recurring deposit and loan products you see
// listed on real bank sites (e.g. Bank of Baroda's "Baroda Advantage",
// Union Bank's "Union Sahayog", ICICI's "iWish"). Seeded once, then
// referenced by loans/deposits.
const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["Fixed Deposit", "Recurring Deposit", "Loan", "Savings"],
      required: true,
    },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    interestRate: { type: String, required: true }, // display string e.g. "6.5% - 7.25% p.a."
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number },
    tenure: { type: String, required: true }, // display string e.g. "7 days - 10 years"
    eligibility: { type: String, required: true },
    highlights: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Scheme", schemeSchema);
