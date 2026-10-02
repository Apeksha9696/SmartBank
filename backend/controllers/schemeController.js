const Scheme = require("../models/Scheme");

// GET /api/schemes?category=Fixed Deposit
async function listSchemes(req, res) {
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  const schemes = await Scheme.find(filter).sort({ category: 1, name: 1 });
  return res.json({ schemes });
}

// GET /api/schemes/:code
async function getScheme(req, res) {
  const scheme = await Scheme.findOne({ code: req.params.code });
  if (!scheme) return res.status(404).json({ message: "Scheme not found" });
  return res.json({ scheme });
}

module.exports = { listSchemes, getScheme };
