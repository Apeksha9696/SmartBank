const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ["Account", "Card", "Loan", "Transaction", "Other"],
      default: "Other",
    },
    status: { type: String, enum: ["queued", "in-progress", "resolved"], default: "queued" },
    queuePosition: { type: Number }, // snapshot of FIFO queue position at creation time
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportTicket", supportTicketSchema);
