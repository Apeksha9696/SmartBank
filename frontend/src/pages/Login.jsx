import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../utils/validateEmail";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address, e.g. name@gmail.com");
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      footer={
        <>
          New to SmartBank?{" "}
          <Link to="/register" className="text-maroon-600 font-semibold hover:underline">
            Open an account
          </Link>
          <br />
          <Link to="/banker/login" className="text-navy-600 hover:underline">
            Banker sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm bg-maroon-50 border border-maroon-100 text-maroon-700 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-navy-800">Password</label>
            <Link to="/forgot-password" className="text-xs text-maroon-600 font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="relative flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-navy-800/10" />
          <span className="text-xs text-navy-600/50 font-medium">or</span>
          <div className="flex-1 h-px bg-navy-800/10" />
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL}/auth/google`}
          className="flex items-center justify-center gap-3 w-full border border-navy-800/20 rounded-lg py-2.5 text-sm font-semibold text-navy-900 hover:bg-parchment/60 transition-colors"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </a>
      </form>
    </AuthShell>
  );
}
