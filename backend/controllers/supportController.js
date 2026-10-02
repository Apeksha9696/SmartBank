const SupportTicket = require("../models/SupportTicket");
const { Queue } = require("../utils/dsa/Queue");

// POST /api/support  { subject, message, category }
async function createTicket(req, res) {
  const { subject, message, category } = req.body;
  if (!subject || !message) return res.status(400).json({ message: "subject and message are required" });

  const queued = await SupportTicket.find({ status: "queued" }).sort({ createdAt: 1 }).lean();
  const queue = new Queue(queued);
  const queuePosition = queue.length + 1; // this new ticket's position once enqueued

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject,
    message,
    category: category || "Other",
    status: "queued",
    queuePosition,
  });

  return res.status(201).json({ ticket });
}

// GET /api/support/me
async function myTickets(req, res) {
  const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json({ tickets });
}

// GET /api/support/queue (admin) — current FIFO order
async function getQueue(req, res) {
  const queued = await SupportTicket.find({ status: "queued" }).sort({ createdAt: 1 }).populate("user", "fullName email");
  const queue = new Queue(queued);
  return res.json({ count: queue.length, queue: queue.toArray() });
}

// PATCH /api/support/:id/resolve (admin) — dequeues the ticket
async function resolveTicket(req, res) {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { status: "resolved" },
    { new: true }
  );
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  return res.json({ ticket });
}

module.exports = { createTicket, myTickets, getQueue, resolveTicket };
