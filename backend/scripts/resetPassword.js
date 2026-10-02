/**
 * Usage: node scripts/resetPassword.js <email> <newPassword>
 * Resets a user's password by re-hashing it via the User model's pre-save hook.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const [, , email, newPassword] = process.argv;

if (!email || !newPassword) {
  console.error("Usage: node scripts/resetPassword.js <email> <newPassword>");
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }
  user.password = newPassword; // pre-save hook will bcrypt-hash this
  await user.save();
  console.log(`Password reset successfully for ${user.email}`);
  await mongoose.disconnect();
})();
