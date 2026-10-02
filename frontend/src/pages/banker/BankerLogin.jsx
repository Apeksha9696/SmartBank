import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/AuthShell";
import { useBankerAuth } from "../../context/BankerAuthContext";

export default function BankerLogin() {
  const { login } = useBankerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", bankerId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.bankerId);
      navigate("/banker/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Sign in failed. Check your email and banker ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Banker desk"
      title={<span className="text-maroon-700 font-extrabold tracking-tight">Banker Sign In</span>}
      footer={
        <Link to="/login" className="text-navy-600 hover:underline">
          Back to customer sign in
        </Link>
      }
    >
      {error && (
        <div className="text-sm bg-maroon-50 border border-maroon-100 text-maroon-700 px-3 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Work email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Banker ID</label>
          <input
            required
            value={form.bankerId}
            onChange={(e) => setForm({ ...form, bankerId: e.target.value.toUpperCase() })}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm font-mono"
            placeholder="BNK-XXXXXX"
          />
        </div>
        <p className="text-xs text-navy-600/60">Your email and banker ID are assigned by the admin.</p>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
