const express = require("express");
const { applyCard, myCards, cardQueue, updateCardStatus } = require("../controllers/cardController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/apply", applyCard);
router.get("/me", myCards);
router.get("/queue", adminOnly, cardQueue);
router.patch("/:id/status", adminOnly, updateCardStatus);

module.exports = router;
