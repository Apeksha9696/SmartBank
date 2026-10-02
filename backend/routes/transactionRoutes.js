const express = require("express");
const { listTransactions, getTransaction, downloadStatement } = require("../controllers/transactionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/", listTransactions);
// Must be registered before "/:id" so "statement" isn't swallowed as an id.
router.get("/statement/download", downloadStatement);
router.get("/:id", getTransaction);

module.exports = router;
