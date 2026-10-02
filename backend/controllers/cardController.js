const Card = require("../models/Card");
const Account = require("../models/Account");

const DEBIT_VARIANTS = ["Classic", "Platinum"];
const CREDIT_VARIANTS = ["Silver", "Gold", "Platinum", "Signature"];

// Simple, explainable credit-limit heuristic (not real underwriting) —
// mirrors the style used for loan interest rates: credit score sets the
// multiplier, annual income sets the base.
function computeCreditLimit({ creditScore, annualIncome }) {
  const multiplier = creditScore >= 800 ? 0.6 : creditScore >= 750 ? 0.45 : creditScore >= 700 ? 0.3 : 0.15;
  const limit = Math.round((annualIncome * multiplier) / 1000) * 1000;
  return Math.min(Math.max(limit, 10000), 1000000);
}

// POST /api/cards/apply  { cardCategory, variant, employmentType?, annualIncome? }
async function applyCard(req, res) {
  try {
    const { cardCategory, variant, employmentType, annualIncome } = req.body;

    if (!["Debit", "Credit"].includes(cardCategory)) {
      return res.status(400).json({ message: "cardCategory must be 'Debit' or 'Credit'" });
    }
    const allowedVariants = cardCategory === "Debit" ? DEBIT_VARIANTS : CREDIT_VARIANTS;
    if (!allowedVariants.includes(variant)) {
      return res.status(400).json({ message: `variant must be one of: ${allowedVariants.join(", ")}` });
    }

    const account = await Account.findOne({ user: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const existing = await Card.findOne({
      user: req.user._id,
      cardCategory,
      status: { $in: ["pending", "approved", "issued"] },
    });
    if (existing) {
      return res.status(409).json({ message: `You already have a ${cardCategory.toLowerCase()} card ${existing.status}.` });
    }

    const card = new Card({
      user: req.user._id,
      account: account._id,
      cardCategory,
      variant,
      nameOnCard: req.user.fullName?.toUpperCase(),
    });

    if (cardCategory === "Debit") {
      // Debit cards ride on an existing savings account, so they're
      // issued immediately — no separate underwriting step needed.
      card.issue();
    } else {
      if (!req.user.kycVerified) {
        return res.status(400).json({ message: "Complete and verify your KYC before applying for a credit card." });
      }
      if (!employmentType || !annualIncome) {
        return res.status(400).json({ message: "employmentType and annualIncome are required for a credit card" });
      }
      card.employmentType = employmentType;
      card.annualIncome = Number(annualIncome);
      card.creditLimit = computeCreditLimit({ creditScore: req.user.creditScore, annualIncome: Number(annualIncome) });
      card.status = "pending";
    }

    await card.save();
    return res.status(201).json({ card });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET /api/cards/me
async function myCards(req, res) {
  const cards = await Card.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json({ cards });
}

// GET /api/cards/queue (admin) — pending credit-card applications
async function cardQueue(req, res) {
  const pending = await Card.find({ status: "pending" })
    .populate("user", "fullName email creditScore kycVerified")
    .sort({ createdAt: 1 });
  return res.json({ count: pending.length, queue: pending });
}

// PATCH /api/cards/:id/status (admin)  { status: "approved" | "rejected", remarks }
async function updateCardStatus(req, res) {
  const { status, remarks } = req.body;
  if (!["approved", "rejected", "blocked"].includes(status)) {
    return res.status(400).json({ message: "status must be 'approved', 'rejected' or 'blocked'" });
  }

  const card = await Card.findById(req.params.id);
  if (!card) return res.status(404).json({ message: "Card application not found" });

  card.remarks = remarks || "";
  if (status === "approved") {
    card.issue(); // generates the card number/CVV/expiry and sets status "issued"
  } else {
    card.status = status;
  }
  await card.save();

  return res.json({ card });
}

module.exports = { applyCard, myCards, cardQueue, updateCardStatus };
