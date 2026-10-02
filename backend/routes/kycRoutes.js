const express = require("express");
const { submitKyc, myKyc, kycQueue, updateKycStatus } = require("../controllers/kycController");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.use(protect);
router.post("/submit", submitKyc);
router.get("/me", myKyc);
router.get("/queue", adminOnly, kycQueue);
router.patch("/:id/status", adminOnly, updateKycStatus);

module.exports = router;
