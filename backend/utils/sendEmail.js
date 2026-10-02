const nodemailer = require("nodemailer");

let cachedTransporter = null;
let warnedNoSmtp = false;

function isSmtpConfigured() {
  return Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return cachedTransporter;
}

/**
 * Sends an email if SMTP is configured (EMAIL_HOST / EMAIL_USER / EMAIL_PASS
 * in backend/.env). If it isn't configured — e.g. in local dev — this logs
 * the message to the console instead of throwing, so flows like "forgot
 * password" still work end-to-end without a real mail account.
 */
async function sendEmail({ to, subject, html, text }) {
  if (!isSmtpConfigured()) {
    if (!warnedNoSmtp) {
      console.warn(
        "[sendEmail] EMAIL_HOST/EMAIL_USER/EMAIL_PASS not set in backend/.env — " +
          "emails will be printed to this console instead of actually sent."
      );
      warnedNoSmtp = true;
    }
    console.log(`\n[sendEmail] (dev mode — not actually sent)\nTo: ${to}\nSubject: ${subject}\n${text || html}\n`);
    return { delivered: false, mode: "console" };
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
  return { delivered: true, mode: "smtp" };
}

module.exports = sendEmail;
