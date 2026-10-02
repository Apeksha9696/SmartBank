import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";
import { isValidEmail } from "../utils/validateEmail";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    accountType: "Savings",
  });
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
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Open an account"
      title="Create your SmartBank account"
      footer={
        <>
          Already banking with us?{" "}
          <Link to="/login" className="text-maroon-600 font-semibold hover:underline">
            Sign in
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
          <label className="block text-sm font-medium text-navy-800 mb-1">Full name</label>
          <input
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="Apeksha Tiwari"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="you@gmail.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Phone</label>
          <input
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="9XXXXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Account type</label>
          <select
            name="accountType"
            value={form.accountType}
            onChange={handleChange}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
          >
            <option>Savings</option>
            <option>Current</option>
            <option>Salary</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="At least 6 characters"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
