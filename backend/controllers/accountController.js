const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { TransferGraph } = require("../utils/dsa/Graph");

// GET /api/accounts/me
async function getMyAccount(req, res) {
  const account = await Account.findOne({ user: req.user._id });
  if (!account) return res.status(404).json({ message: "Account not found" });
  return res.json({ account });
}

// POST /api/accounts/deposit  { amount, note }
async function deposit(req, res) {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "amount must be a positive number" });

    const account = await Account.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { balance: Number(amount) } },
      { new: true }
    );
    if (!account) return res.status(404).json({ message: "Account not found" });

    const txn = await Transaction.create({ account: account._id, type: "deposit", amount, balanceAfter: account.balance, note });
    return res.status(201).json({ account, transaction: txn });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

// POST /api/accounts/withdraw  { amount, note }
async function withdraw(req, res) {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "amount must be a positive number" });

    const account = await Account.findOne({ user: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    account.balance -= Number(amount);
    await account.save();

    const txn = await Transaction.create({ account: account._id, type: "withdrawal", amount, balanceAfter: account.balance, note });
    return res.status(201).json({ account, transaction: txn });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

// POST /api/accounts/transfer  { toAccountNumber, amount, note }
// Also feeds the in-memory TransferGraph so we can run DFS-based cycle
// detection across recent transfers and flag suspicious circular activity.
async function transfer(req, res) {
  try {
    const { toAccountNumber, amount, note } = req.body;
    if (!toAccountNumber || !amount || amount <= 0) {
      return res.status(400).json({ message: "toAccountNumber and a positive amount are required" });
    }

    const fromAccount = await Account.findOne({ user: req.user._id });
    if (!fromAccount) return res.status(404).json({ message: "Sender account not found" });
    if (fromAccount.accountNumber === toAccountNumber) return res.status(400).json({ message: "Cannot transfer to your own account" });
    if (fromAccount.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
    if (!toAccount) return res.status(404).json({ message: "Recipient account number not found" });

    fromAccount.balance -= Number(amount);
    toAccount.balance += Number(amount);
    await fromAccount.save();
    await toAccount.save();

    const outTxn = await Transaction.create({
      account: fromAccount._id,
      type: "transfer-out",
      amount,
      balanceAfter: fromAccount.balance,
      counterpartyAccount: toAccount.accountNumber,
      note,
    });

    await Transaction.create({
      account: toAccount._id,
      type: "transfer-in",
      amount,
      balanceAfter: toAccount.balance,
      counterpartyAccount: fromAccount.accountNumber,
      note,
    });

    // Fraud-pattern check: look at this sender's recent outgoing transfer
    // edges and run DFS cycle detection (A -> B -> C -> A style rings).
    const recentTransfers = await Transaction.find({
      type: "transfer-out",
      createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
    })
      .populate("account", "accountNumber")
      .limit(500);

    const graph = new TransferGraph();
    for (const t of recentTransfers) {
      if (t.account?.accountNumber && t.counterpartyAccount) {
        graph.addTransferEdge(t.account.accountNumber, t.counterpartyAccount);
      }
    }
    const cycles = graph.detectCycles().filter((c) => c.includes(fromAccount.accountNumber));

    return res.status(201).json({
      fromAccount,
      transaction: outTxn,
      fraudCheck: cycles.length > 0 ? { flagged: true, cycles } : { flagged: false },
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

module.exports = { getMyAccount, deposit, withdraw, transfer };
