// Mirrors the backend's EMAIL_REGEX (backend/utils/validators.js) so the
// user gets the same "is this actually a valid email" feedback instantly,
// before the request even reaches the server.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}
