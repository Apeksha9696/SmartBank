const express = require("express");
const { applyLoan, myLoans, loanQueue, updateLoanStatus } = require("../controllers/loanController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/apply", applyLoan);
router.get("/me", myLoans);
router.get("/queue", adminOnly, loanQueue);
router.patch("/:id/status", adminOnly, updateLoanStatus);

module.exports = router;
