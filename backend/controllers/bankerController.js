const Banker = require("../models/Banker");
const generateBankerToken = require("../utils/generateBankerToken");
const { isValidEmail } = require("../utils/validators");

// POST /api/banker/login  { email, bankerId }
async function loginWithId(req, res) {
  try {
    const { email, bankerId } = req.body;
    if (!email || !bankerId) {
      return res.status(400).json({ message: "email and bankerId are required" });
    }
    const banker = await Banker.findOne({
      email: email.trim().toLowerCase(),
      bankerId: bankerId.trim().toUpperCase(),
    });
    if (!banker || !banker.active) {
      return res.status(401).json({ message: "No banker found matching that email and ID" });
    }
    const token = generateBankerToken(banker._id);
    return res.json({ token, banker: banker.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET /api/banker/me
async function getMe(req, res) {
  return res.json({ banker: req.banker });
}

// POST /api/admin/employees  — admin creates a banker
async function createEmployee(req, res) {
  try {
    const { fullName, email, branch, designation } = req.body;
    if (!fullName || !email) {
      return res.status(400).json({ message: "fullName and email are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }
    const existing = await Banker.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "A banker with this email already exists" });
    }
    const bankerId = await Banker.generateUniqueBankerId();
    // password is bankerId by default; banker can't change it (admin-managed)
    const banker = await Banker.create({
      fullName,
      email,
      password: bankerId, // hashed by pre-save hook
      bankerId,
      branch: branch || "",
      designation: designation || "Loan Officer",
    });
    return res.status(201).json({ banker: banker.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET /api/admin/employees
async function listEmployees(req, res) {
  try {
    const bankers = await Banker.find().select("-password").sort({ createdAt: -1 });
    return res.json({ bankers });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// PATCH /api/admin/employees/:id
async function updateEmployee(req, res) {
  try {
    const { fullName, email, branch, designation, active } = req.body;
    const banker = await Banker.findByIdAndUpdate(
      req.params.id,
      { ...(fullName && { fullName }), ...(email && { email }), ...(branch !== undefined && { branch }), ...(designation && { designation }), ...(active !== undefined && { active }) },
      { new: true, runValidators: true }
    ).select("-password");
    if (!banker) return res.status(404).json({ message: "Banker not found" });
    return res.json({ banker });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// DELETE /api/admin/employees/:id
async function deleteEmployee(req, res) {
  try {
    await Banker.findByIdAndDelete(req.params.id);
    return res.json({ message: "Banker removed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { loginWithId, getMe, createEmployee, listEmployees, updateEmployee, deleteEmployee };
