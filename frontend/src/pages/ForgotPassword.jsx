import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../api/axios";
import { isValidEmail } from "../utils/validateEmail";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!isValidEmail(email)) {
      setError("Enter a valid email address, e.g. name@gmail.com");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setMessage(data.message);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot your password?"
      footer={
        <Link to="/login" className="text-maroon-600 font-semibold hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm bg-maroon-50 border border-maroon-100 text-maroon-700 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="text-sm bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-lg">
            {message}
          </div>
        )}
        <p className="text-sm text-navy-600/80">
          Enter the email on your account and we'll send a link to reset your password.
        </p>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="you@gmail.com"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
