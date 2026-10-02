const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { EMAIL_REGEX } = require("../utils/validators");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "Enter a valid email address (e.g. name@gmail.com)"],
    },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, required: true },
    dob: { type: Date },
    address: { type: String },
    panNumber: { type: String, uppercase: true },
    aadhaarLast4: { type: String },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    creditScore: { type: Number, default: 650, min: 300, max: 900 },
    kycVerified: { type: Boolean, default: false },
    // Forgot-password flow: we store a hash of the reset token (never the
    // raw token) plus an expiry, mirroring how the password itself is hashed.
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
