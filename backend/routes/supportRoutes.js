const express = require("express");
const { createTicket, myTickets, getQueue, resolveTicket } = require("../controllers/supportController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/", createTicket);
router.get("/me", myTickets);
router.get("/queue", adminOnly, getQueue);
router.patch("/:id/resolve", adminOnly, resolveTicket);

module.exports = router;
