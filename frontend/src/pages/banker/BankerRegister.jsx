import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Copy } from "lucide-react";
import AuthShell from "../../components/AuthShell";
import { useBankerAuth } from "../../context/BankerAuthContext";
import { isValidEmail } from "../../utils/validateEmail";

export default function BankerRegister() {
  const { register } = useBankerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    branch: "",
    designation: "Loan Officer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(null); // { bankerId, fullName }
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address, e.g. name@gmail.com");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await register(form);
      setIssued({ bankerId: data.banker.bankerId, fullName: data.banker.fullName });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(issued.bankerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (issued) {
    return (
      <AuthShell eyebrow="Banker desk" title="You're registered">
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
            <CheckCircle2 size={18} />
            Account created for {issued.fullName}
          </div>
          <div>
            <p className="text-sm text-navy-700 mb-2">
              This is your unique banker ID. From now on, you'll sign in with your <b>name</b> and this{" "}
              <b>ID</b> — save it somewhere safe, it won't be shown again.
            </p>
            <div className="flex items-center justify-between gap-3 bg-navy-900 text-parchment rounded-lg px-4 py-3">
              <span className="font-mono text-lg tracking-wide">{issued.bankerId}</span>
              <button
                onClick={copyId}
                className="flex items-center gap-1.5 text-xs font-semibold bg-gold-500 text-navy-900 px-3 py-1.5 rounded-md hover:opacity-90"
              >
                <Copy size={13} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate("/banker/dashboard")}
            className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors"
          >
            Continue to dashboard
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Banker desk"
      title="Register as a banker"
      footer={
        <>
          Already have a banker ID?{" "}
          <Link to="/banker/login" className="text-maroon-600 font-semibold hover:underline">
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
        <p className="text-xs text-navy-600/70 bg-navy-50/60 border border-navy-800/5 rounded-lg px-3 py-2">
          One-time signup only. On success you'll be issued a unique banker ID by the bank — use your name +
          that ID to sign in every time after this.
        </p>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Full name</label>
          <input
            name="fullName"
            required
            value={form.fullName}
            onChange={handleChange}
            className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            placeholder="Your real name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1">Work email</label>
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">Branch</label>
            <input
              name="branch"
              value={form.branch}
              onChange={handleChange}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
              placeholder="Jalandhar Main"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">Designation</label>
            <select
              name="designation"
              value={form.designation}
              onChange={handleChange}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
            >
              <option>Loan Officer</option>
              <option>Branch Manager</option>
              <option>Credit Analyst</option>
              <option>Relationship Manager</option>
            </select>
          </div>
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
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
    </AuthShell>
  );
}
