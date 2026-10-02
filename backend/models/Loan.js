const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    scheme: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme" },
    loanType: {
      type: String,
      enum: ["Personal", "Home", "Education", "Vehicle", "Business"],
      required: true,
    },
    amountRequested: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    interestRate: { type: Number, required: true }, // annual %, computed at application time
    monthlyIncome: { type: Number, required: true },
    creditScoreAtApplication: { type: Number, required: true },
    priorityScore: { type: Number, required: true }, // used by the heap/priority queue
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected", "disbursed", "closed"],
      default: "pending",
    },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
