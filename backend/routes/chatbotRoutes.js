const express = require("express");
const { sendMessage, getHistory, clearHistory, getSuggestions } = require("../controllers/chatbotController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Every chatbot endpoint is JWT-protected — the bot answers using the
// customer's own records, so there is no anonymous access.
router.use(protect);

router.post("/message", sendMessage);
router.get("/history", getHistory);
router.delete("/history", clearHistory);
router.get("/suggestions", getSuggestions);

module.exports = router;
