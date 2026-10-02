const Account = require("../models/Account");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { TransactionLinkedList } = require("../utils/dsa/LinkedList");
const { mergeSort } = require("../utils/dsa/sort");
const { binarySearchByTimestamp } = require("../utils/dsa/search");

// GET /api/transactions?sortBy=amount|date&order=asc|desc&onOrAfter=<ISO date>
// The ledger is fetched from MongoDB, then rebuilt as a linked list to
// demonstrate node-based traversal, optionally merge-sorted, and
// optionally binary-searched by date.
async function listTransactions(req, res) {
  const account = await Account.findOne({ user: req.user._id });
  if (!account) return res.status(404).json({ message: "Account not found" });

  const docs = await Transaction.find({ account: account._id }).sort({ createdAt: -1 }).lean();

  // Rebuild as a linked list (newest-first) then flatten back to an array
  const ledger = TransactionLinkedList.fromArray(docs);
  let transactions = ledger.toArray();

  const { sortBy, order = "desc", onOrAfter } = req.query;

  if (sortBy === "amount") {
    transactions = mergeSort(transactions, (a, b) =>
      order === "asc" ? a.amount - b.amount : b.amount - a.amount
    );
  } else if (sortBy === "date") {
    transactions = mergeSort(transactions, (a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt);
      return order === "asc" ? diff : -diff;
    });
  }

  let cutoffIndex = null;
  if (onOrAfter) {
    // Binary search expects ascending-by-time input
    const ascending = mergeSort(transactions, (a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    cutoffIndex = binarySearchByTimestamp(ascending, new Date(onOrAfter).getTime());
  }

  return res.json({
    count: transactions.length,
    transactions,
    ...(cutoffIndex !== null ? { firstIndexOnOrAfter: cutoffIndex } : {}),
  });
}

// GET /api/transactions/:id
async function getTransaction(req, res) {
  const account = await Account.findOne({ user: req.user._id });
  if (!account) return res.status(404).json({ message: "Account not found" });

  const docs = await Transaction.find({ account: account._id }).sort({ createdAt: -1 }).lean();
  const ledger = TransactionLinkedList.fromArray(docs);
  const found = ledger.find((t) => String(t._id) === req.params.id);

  if (!found) return res.status(404).json({ message: "Transaction not found" });
  return res.json({ transaction: found });
}

const PDFDocument = require("pdfkit");

// GET /api/transactions/statement/download?from=<ISO date>&to=<ISO date>
// Builds a PDF bank statement for the signed-in user's account.
async function downloadStatement(req, res) {
  try {
    const account = await Account.findOne({ user: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));

    const query = { account: account._id };
    if (from || to) query.createdAt = dateFilter;

    const docs = await Transaction.find(query).sort({ createdAt: 1 }).lean();
    const user = await User.findById(req.user._id);

    const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => {
      const pdf = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdf.length);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="smartbank-statement-${account.accountNumber}.pdf"`
      );
      res.status(200).end(pdf);
    });

    // Header
    doc.fontSize(18).font("Helvetica-Bold").text("SmartBank - Account Statement", { align: "center" });
    doc.moveDown(0.5);

    // Account info
    const info = [
      ["Account Holder", user?.fullName],
      ["Account Number", account.accountNumber],
      ["IFSC Code", account.ifscCode],
      ["Account Type", account.accountType],
      ["Statement Period", `${from || "account opening"} to ${to || "today"}`],
      ["Generated On", new Date().toLocaleString("en-IN")],
      ["Closing Balance", `Rs. ${Number(account.balance).toLocaleString("en-IN")}`],
    ];
    doc.fontSize(10).font("Helvetica");
    info.forEach(([label, value]) => {
      doc.font("Helvetica-Bold").text(`${label}: `, { continued: true }).font("Helvetica").text(String(value ?? ""));
    });
    doc.moveDown();

    // Table header
    const cols = ["Date", "Type", "Note", "Counterparty", "Amount", "Balance After"];
    const colWidths = [110, 70, 110, 90, 65, 70];
    const startX = 40;
    let y = doc.y;

    doc.font("Helvetica-Bold").fontSize(9);
    let x = startX;
    cols.forEach((col, i) => {
      doc.text(col, x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });
    y += 16;
    doc.moveTo(startX, y).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y).stroke();
    y += 4;

    // Table rows
    doc.font("Helvetica").fontSize(8);
    docs.forEach((t) => {
      if (y > 760) { doc.addPage(); y = 40; }
      const signedAmount = t.type.includes("in") || t.type === "deposit" ? t.amount : -t.amount;
      const row = [
        new Date(t.createdAt).toLocaleString("en-IN"),
        t.type.replace("-", " "),
        t.note || "",
        t.counterpartyAccount || "",
        (signedAmount >= 0 ? "+" : "") + Number(signedAmount).toLocaleString("en-IN"),
        Number(t.balanceAfter).toLocaleString("en-IN"),
      ];
      x = startX;
      row.forEach((cell, i) => {
        doc.text(String(cell), x, y, { width: colWidths[i], ellipsis: true });
        x += colWidths[i];
      });
      y += 14;
    });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Failed to generate PDF" });
  }
}

module.exports = { listTransactions, getTransaction, downloadStatement };
