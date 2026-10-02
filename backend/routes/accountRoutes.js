const express = require("express");
const { getMyAccount, deposit, withdraw, transfer } = require("../controllers/accountController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.get("/me", getMyAccount);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/transfer", transfer);

module.exports = router;
