const mongoose = require("mongoose");

function generateCardNumber() {
  // 16-digit card number, bank-style (not Luhn-valid, this is a demo).
  let num = "";
  for (let i = 0; i < 16; i += 1) num += Math.floor(Math.random() * 10);
  return num;
}

function generateCvv() {
  return String(Math.floor(100 + Math.random() * 900));
}

const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },

    cardCategory: { type: String, enum: ["Debit", "Credit"], required: true },
    variant: {
      type: String,
      enum: ["Classic", "Platinum", "Silver", "Gold", "Signature"],
      required: true,
    },

    // Credit-only underwriting inputs — same shape as loan applications.
    employmentType: { type: String, enum: ["Salaried", "Self-employed", "Student", "Other"] },
    annualIncome: { type: Number },
    creditLimit: { type: Number },

    cardNumber: { type: String }, // set on issue
    nameOnCard: { type: String },
    expiryMonth: { type: Number },
    expiryYear: { type: Number },
    cvv: { type: String, select: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "issued", "blocked"],
      default: "pending",
    },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

cardSchema.methods.issue = function issue() {
  const now = new Date();
  this.cardNumber = generateCardNumber();
  this.cvv = generateCvv();
  this.expiryMonth = now.getMonth() + 1;
  this.expiryYear = now.getFullYear() + 5;
  this.status = "issued";
};

cardSchema.virtual("maskedNumber").get(function maskedNumber() {
  return this.cardNumber ? `•••• •••• •••• ${this.cardNumber.slice(-4)}` : null;
});

cardSchema.set("toJSON", { virtuals: true });
cardSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Card", cardSchema);
module.exports.generateCardNumber = generateCardNumber;
