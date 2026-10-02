import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import api from "../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      localStorage.setItem("smartbank_token", data.token);
      setDone(true);
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthShell eyebrow="Account recovery" title="Password updated">
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
          Your password has been reset. Taking you to your dashboard…
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Set a new password"
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
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">New password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Confirm new password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="Re-enter password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Updating…" : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}
