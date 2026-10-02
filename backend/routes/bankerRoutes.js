const express = require("express");
const { loginWithId, getMe, createEmployee, listEmployees, updateEmployee, deleteEmployee } = require("../controllers/bankerController");
const { loanQueue, updateLoanStatus } = require("../controllers/loanController");
const { bankerProtect } = require("../middleware/bankerAuth");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.post("/login", loginWithId);
router.get("/me", bankerProtect, getMe);

router.get("/loans/queue", bankerProtect, loanQueue);
router.patch("/loans/:id/status", bankerProtect, updateLoanStatus);

// Admin-only employee management
router.post("/admin/employees", protect, adminOnly, createEmployee);
router.get("/admin/employees", protect, adminOnly, listEmployees);
router.patch("/admin/employees/:id", protect, adminOnly, updateEmployee);
router.delete("/admin/employees/:id", protect, adminOnly, deleteEmployee);

module.exports = router;
