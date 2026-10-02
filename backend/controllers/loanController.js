const Loan = require("../models/Loan");
const Account = require("../models/Account");
const Scheme = require("../models/Scheme");
const { PriorityQueue } = require("../utils/dsa/PriorityQueue");

function computePriorityScore({ creditScore, monthlyIncome, amountRequested }) {
  // Higher credit score & income relative to loan size => higher priority.
  // This is a simple, explainable heuristic (not real underwriting).
  const incomeToLoanRatio = Math.min(monthlyIncome * 12 / Math.max(amountRequested, 1), 3);
  return Math.round(creditScore * 0.6 + incomeToLoanRatio * 100 * 0.4);
}

function computeInterestRate(loanType, creditScore) {
  const base = { Personal: 12.5, Home: 8.5, Education: 9.5, Vehicle: 9.75, Business: 11.5 }[loanType] ?? 12;
  const discount = creditScore >= 800 ? 1.5 : creditScore >= 750 ? 1 : creditScore >= 700 ? 0.5 : 0;
  return Number((base - discount).toFixed(2));
}

// POST /api/loans/apply
async function applyLoan(req, res) {
  try {
    const { loanType, amountRequested, tenureMonths, monthlyIncome, schemeCode } = req.body;
    if (!loanType || !amountRequested || !tenureMonths || !monthlyIncome) {
      return res.status(400).json({ message: "loanType, amountRequested, tenureMonths, monthlyIncome are required" });
    }

    const account = await Account.findOne({ user: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const scheme = schemeCode ? await Scheme.findOne({ code: schemeCode }) : null;
    const creditScore = req.user.creditScore;
    const interestRate = computeInterestRate(loanType, creditScore);
    const priorityScore = computePriorityScore({ creditScore, monthlyIncome, amountRequested });

    const loan = await Loan.create({
      user: req.user._id,
      account: account._id,
      scheme: scheme?._id,
      loanType,
      amountRequested,
      tenureMonths,
      interestRate,
      monthlyIncome,
      creditScoreAtApplication: creditScore,
      priorityScore,
      status: "pending",
    });

    return res.status(201).json({ loan });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET /api/loans/me
async function myLoans(req, res) {
  const loans = await Loan.find({ user: req.user._id }).populate("scheme").sort({ createdAt: -1 });
  return res.json({ loans });
}

// GET /api/loans/queue  (admin) — pending loans ranked by the priority
// queue (max-heap on priorityScore), i.e. the actual processing order.
async function loanQueue(req, res) {
  const pending = await Loan.find({ status: { $in: ["pending", "under-review"] } })
    .populate("user", "fullName email creditScore")
    .lean();

  const pq = new PriorityQueue((a, b) => a.priorityScore - b.priorityScore);
  pending.forEach((loan) => pq.insert(loan));

  const ranked = pq.toSortedArray().map((loan, idx) => ({ rank: idx + 1, ...loan }));
  return res.json({ count: ranked.length, queue: ranked });
}

// PATCH /api/loans/:id/status  (admin)  { status, remarks }
async function updateLoanStatus(req, res) {
  const { status, remarks } = req.body;
  const allowed = ["pending", "under-review", "approved", "rejected", "disbursed", "closed"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const loan = await Loan.findByIdAndUpdate(
    req.params.id,
    { status, remarks: remarks || "" },
    { new: true }
  );
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  return res.json({ loan });
}

module.exports = { applyLoan, myLoans, loanQueue, updateLoanStatus };
