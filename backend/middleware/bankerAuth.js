const jwt = require("jsonwebtoken");
const Banker = require("../models/Banker");

async function bankerProtect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "banker") {
      return res.status(401).json({ message: "Not authorized as banker" });
    }

    const banker = await Banker.findById(decoded.id).select("-password");
    if (!banker || !banker.active) {
      return res.status(401).json({ message: "Banker account no longer active" });
    }
    req.banker = banker;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
}

module.exports = { bankerProtect };
