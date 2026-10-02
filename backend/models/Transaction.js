const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer-out", "transfer-in", "loan-disbursement", "loan-repayment"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },
    counterpartyAccount: { type: String }, // account number on the other side of a transfer
    note: { type: String, default: "" },
    status: { type: String, enum: ["success", "reversed", "flagged"], default: "success" },
  },
  { timestamps: true }
);

transactionSchema.index({ account: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
