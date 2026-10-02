const Kyc = require("../models/Kyc");
const User = require("../models/User");

const REQUIRED_FIELDS = [
  "fullName",
  "dob",
  "gender",
  "maritalStatus",
  "permanentAddress",
  "currentAddress",
  "occupation",
  "annualIncome",
  "panNumber",
  "aadhaarNumber",
  "photo",
  "signature",
];

// POST /api/kyc/submit
// Upserts the customer's KYC document and (re)sets it to "pending" so it
// re-enters the review queue — used both for the first submission and for
// resubmission after a rejection.
async function submitKyc(req, res) {
  try {
    const body = req.body || {};
    const missing = REQUIRED_FIELDS.filter((f) => !body[f] && body[f] !== 0);
    if (missing.length) {
      return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(body.panNumber)) {
      return res.status(400).json({ message: "Enter a valid PAN (e.g. ABCDE1234F)" });
    }
    if (!/^\d{12}$/.test(body.aadhaarNumber)) {
      return res.status(400).json({ message: "Aadhaar number must be 12 digits" });
    }

    const payload = {
      user: req.user._id,
      fullName: body.fullName,
      dob: body.dob,
      gender: body.gender,
      maritalStatus: body.maritalStatus,
      permanentAddress: body.permanentAddress,
      currentAddress: body.sameAsPermanent ? body.permanentAddress : body.currentAddress,
      sameAsPermanent: !!body.sameAsPermanent,
      occupation: body.occupation,
      annualIncome: Number(body.annualIncome),
      panNumber: body.panNumber.toUpperCase(),
      aadhaarLast4: body.aadhaarNumber.slice(-4),
      photo: body.photo,
      signature: body.signature,
      nominee: {
        name: body.nominee?.name || "",
        relation: body.nominee?.relation || "",
        dob: body.nominee?.dob || undefined,
      },
      status: "pending",
      remarks: "",
      reviewedAt: undefined,
    };

    const kyc = await Kyc.findOneAndUpdate({ user: req.user._id }, payload, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    return res.status(201).json({ kyc });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

// GET /api/kyc/me
async function myKyc(req, res) {
  const kyc = await Kyc.findOne({ user: req.user._id });
  return res.json({ kyc, kycVerified: !!req.user.kycVerified });
}

// GET /api/kyc/queue (admin) — pending submissions, oldest first (FIFO review)
async function kycQueue(req, res) {
  const pending = await Kyc.find({ status: "pending" })
    .populate("user", "fullName email phone kycVerified")
    .sort({ createdAt: 1 });
  return res.json({ count: pending.length, queue: pending });
}

// PATCH /api/kyc/:id/status (admin)  { status: "verified" | "rejected", remarks }
async function updateKycStatus(req, res) {
  const { status, remarks } = req.body;
  if (!["verified", "rejected"].includes(status)) {
    return res.status(400).json({ message: "status must be 'verified' or 'rejected'" });
  }

  const kyc = await Kyc.findById(req.params.id);
  if (!kyc) return res.status(404).json({ message: "KYC submission not found" });

  kyc.status = status;
  kyc.remarks = remarks || "";
  kyc.reviewedAt = new Date();
  await kyc.save();

  await User.findByIdAndUpdate(kyc.user, { kycVerified: status === "verified" });

  return res.json({ kyc });
}

module.exports = { submitKyc, myKyc, kycQueue, updateKycStatus };
