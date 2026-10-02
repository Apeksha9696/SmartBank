/**
 * Creates (or promotes) an admin account for the admin portal.
 *
 * Usage:
 *   node scripts/createAdmin.js <fullName> <email> <password>
 *
 * Example:
 *   node scripts/createAdmin.js "Priya Sharma" priya@smartbank.com Sup3rSecret!
 *
 * - If no user exists with that email, a new one is created directly with
 *   role "admin" (bypassing the public /register endpoint, which always
 *   creates customers).
 * - If a user with that email already exists, it's promoted to admin and
 *   its password is reset to the one provided.
 * Sign in at /admin/login with this email + password once it's done.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Account = require("../models/Account");

const [, , fullName, email, password] = process.argv;

if (!fullName || !email || !password) {
  console.error("Usage: node scripts/createAdmin.js <fullName> <email> <password>");
  process.exit(1);
}

if (password.length < 6) {
  console.error("Password must be at least 6 characters");
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email: email.trim().toLowerCase() });

  if (user) {
    user.role = "admin";
    user.password = password; // pre-save hook re-hashes it
    await user.save();
    console.log(`Existing account ${user.email} promoted to admin and password updated.`);
  } else {
    user = await User.create({
      fullName,
      email,
      password,
      phone: "0000000000",
      role: "admin",
    });
    await Account.create({ user: user._id, accountType: "Savings", balance: 0 });
    console.log(`Admin account created: ${user.email}`);
  }

  console.log("Sign in at /admin/login with this email and password.");
  await mongoose.disconnect();
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
