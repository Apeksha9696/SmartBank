const mongoose = require("mongoose");

function generateAccountNumber() {
  // 12-digit account number, bank-style
  let num = "";
  for (let i = 0; i < 12; i += 1) num += Math.floor(Math.random() * 10);
  return num;
}

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountNumber: { type: String, unique: true, default: generateAccountNumber },
    ifscCode: { type: String, default: "SBIN0SMART1" },
    accountType: {
      type: String,
      enum: ["Savings", "Current", "Salary"],
      default: "Savings",
    },
    balance: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["active", "frozen", "closed"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
module.exports.generateAccountNumber = generateAccountNumber;
