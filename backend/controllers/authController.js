const crypto = require("crypto");
const User = require("../models/User");
const Account = require("../models/Account");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const { isValidEmail } = require("../utils/validators");

// POST /api/auth/register
async function register(req, res) {
  try {
    const { fullName, email, password, phone, dob, address, panNumber, accountType } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "fullName, email, password and phone are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address, e.g. name@gmail.com" });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists" });

    const user = await User.create({ fullName, email, password, phone, dob, address, panNumber });

    const account = await Account.create({
      user: user._id,
      accountType: accountType || "Savings",
      balance: 0,
    });

    const token = generateToken(user._id);
    return res.status(201).json({
      token,
      user: user.toSafeObject(),
      account,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/auth/login — this is the login flow, credentials are checked
// against the hashed password stored in MongoDB (User collection).
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    // Trim whitespace before lookup — a stray leading/trailing space (common
    // with copy-pasted or autofilled emails) was causing findOne to miss an
    // otherwise-correct account and return "Invalid email or password".
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);
    return res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/auth/admin-login — separate entry point for the admin portal.
// Same credential check as customer login, but rejects any account whose
// role isn't "admin" so the admin portal can never be used to sign in as
// a regular customer (and vice versa).
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    if (user.role !== "admin") {
      return res.status(403).json({ message: "This account doesn't have admin access" });
    }

    const token = generateToken(user._id);
    return res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  return res.json({ user: req.user });
}

// POST /api/auth/forgot-password  { email }
// Always responds with the same generic message whether or not the email
// exists, so the endpoint can't be used to find out which emails are
// registered. If the account exists, a time-limited reset link is emailed.
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email address, e.g. name@gmail.com" });
    }

    const genericMessage = "If an account with that email exists, a password reset link has been sent.";

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.json({ message: genericMessage });

    // Raw token is emailed to the user; only its hash is stored, same idea
    // as never storing a plaintext password.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateModifiedOnly: true });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "SmartBank — Reset your password",
      text: `We received a request to reset your SmartBank password. This link expires in 30 minutes:\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`,
      html: `<p>We received a request to reset your SmartBank password.</p><p><a href="${resetLink}">Reset your password</a> (link expires in 30 minutes).</p><p>If you didn't request this, you can safely ignore this email.</p>`,
    });

    return res.json({ message: genericMessage });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// POST /api/auth/reset-password/:token  { password }
async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordTokenHash +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired" });
    }

    user.password = password; // pre-save hook re-hashes it
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    return res.json({ message: "Password reset successfully", token: jwtToken, user: user.toSafeObject() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { register, login, adminLogin, getMe, forgotPassword, resetPassword };
