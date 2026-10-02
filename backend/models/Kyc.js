const mongoose = require("mongoose");

// Customer e-KYC submission. Mirrors the fields the RBI mandates on every
// bank's physical/online KYC form (identity, address, income, PAN/Aadhaar,
// photo, signature, nominee). One document per user — resubmission
// overwrites the previous draft and resets status back to "pending".
const kycSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    fullName: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"], required: true },

    permanentAddress: { type: String, required: true },
    currentAddress: { type: String, required: true },
    sameAsPermanent: { type: Boolean, default: false },

    occupation: { type: String, required: true },
    annualIncome: { type: Number, required: true, min: 0 },

    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN (e.g. ABCDE1234F)"],
    },
    // We only ever persist the last 4 digits (matches User.aadhaarLast4) —
    // the controller validates the full 12-digit number on input but never
    // stores it, the same way card numbers are masked elsewhere.
    aadhaarLast4: {
      type: String,
      required: true,
      match: [/^\d{4}$/, "Invalid Aadhaar"],
    },

    // Small base64 data-URLs captured from <input type="file"> on the form.
    photo: { type: String, required: true },
    signature: { type: String, required: true },

    nominee: {
      name: { type: String, default: "" },
      relation: { type: String, default: "" },
      dob: { type: Date },
    },

    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    remarks: { type: String, default: "" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Kyc", kycSchema);
