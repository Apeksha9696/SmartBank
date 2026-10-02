// Simple, dependable email format check — requires a local part, an "@",
// and a domain with a real TLD (e.g. name@gmail.com, name@bank.co.in).
// Not a full RFC 5322 validator (nothing practical is), just enough to
// reject typos like "name@gmail" or "name.com" before they hit the DB.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

module.exports = { isValidEmail, EMAIL_REGEX };
