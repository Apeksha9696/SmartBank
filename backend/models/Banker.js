const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { EMAIL_REGEX } = require("../utils/validators");

// Unambiguous character set (no 0/O, 1/I) so a banker can read the ID back
// over the phone without confusion.
const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRawBankerId() {
  let id = "BNK-";
  for (let i = 0; i < 6; i += 1) {
    id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return id;
}

const bankerSchema = new mongoose.Schema(
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
    // The unique ID issued to the banker on first registration. From then
    // on, login uses fullName + bankerId instead of email + password.
    bankerId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    branch: { type: String, default: "" },
    designation: { type: String, default: "Loan Officer" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bankerSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

bankerSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

bankerSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Generates a bankerId guaranteed not to collide with an existing one.
bankerSchema.statics.generateUniqueBankerId = async function generateUniqueBankerId() {
  let candidate;
  let exists = true;
  while (exists) {
    candidate = generateRawBankerId();
    // eslint-disable-next-line no-await-in-loop
    exists = await this.exists({ bankerId: candidate });
  }
  return candidate;
};

module.exports = mongoose.model("Banker", bankerSchema);
