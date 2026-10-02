const jwt = require("jsonwebtoken");

// Tagged with type: "banker" so the banker-auth middleware can reject a
// customer token (and vice versa) even though both are signed with the
// same JWT_SECRET.
function generateBankerToken(bankerMongoId) {
  return jwt.sign({ id: bankerMongoId, type: "banker" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

module.exports = generateBankerToken;
