import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import api from "../api/axios";

const loanTypes = ["Personal", "Home", "Education", "Vehicle", "Business"];

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [form, setForm] = useState({
    loanType: "Personal",
    amountRequested: "",
    tenureMonths: "",
    monthlyIncome: "",
    schemeCode: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadLoans = async () => {
    const { data } = await api.get("/loans/me");
    setLoans(data.loans);
  };

  useEffect(() => {
    loadLoans();
    api.get("/schemes", { params: { category: "Loan" } }).then(({ data }) => setSchemes(data.schemes));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await api.post("/loans/apply", {
        ...form,
        amountRequested: Number(form.amountRequested),
        tenureMonths: Number(form.tenureMonths),
        monthlyIncome: Number(form.monthlyIncome),
      });
      setStatus({ type: "success", message: "Loan application submitted for review." });
      setForm({ loanType: "Personal", amountRequested: "", tenureMonths: "", monthlyIncome: "", schemeCode: "" });
      loadLoans();
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Application failed." });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    pending: "bg-navy-50 text-navy-700",
    "under-review": "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    disbursed: "bg-emerald-50 text-emerald-700",
    rejected: "bg-maroon-50 text-maroon-700",
    closed: "bg-navy-50 text-navy-500",
  };

  return (
    <DashboardLayout>
      <Topbar subtitle="Credit desk" title="Loans" />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-navy-800/5 shadow-card p-6 h-fit">
          <h2 className="font-display text-xl text-navy-900 mb-1">Apply for a loan</h2>
          <p className="text-xs text-navy-600/60 mb-4 font-mono">
            queued & ranked by a priority heap on submission
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {status && (
              <div
                className={`text-sm px-3 py-2 rounded-lg border ${
                  status.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-maroon-50 border-maroon-100 text-maroon-700"
                }`}
              >
                {status.message}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Loan type</label>
              <select
                name="loanType"
                value={form.loanType}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm"
              >
                {loanTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Scheme (optional)</label>
              <select
                name="schemeCode"
                value={form.schemeCode}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm"
              >
                <option value="">— None —</option>
                {schemes.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Amount requested (₹)</label>
              <input
                type="number"
                name="amountRequested"
                required
                min="1000"
                value={form.amountRequested}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Tenure (months)</label>
              <input
                type="number"
                name="tenureMonths"
                required
                min="1"
                value={form.tenureMonths}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Monthly income (₹)</label>
              <input
                type="number"
                name="monthlyIncome"
                required
                min="1"
                value={form.monthlyIncome}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit application"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h2 className="font-display text-xl text-navy-900">Your applications</h2>
          {loans.length === 0 && (
            <p className="text-sm text-navy-600/70 bg-white rounded-xl border border-navy-800/5 p-6">
              No applications yet.
            </p>
          )}
          {loans.map((l) => (
            <div key={l._id} className="bg-white rounded-xl border border-navy-800/5 shadow-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg text-navy-900">{l.loanType} Loan</p>
                  <p className="text-xs text-navy-600/60 font-mono">
                    Applied {new Date(l.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full font-semibold ${statusColor[l.status]}`}>
                  {l.status.replace("-", " ")}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-navy-600/60 text-xs">Amount</p>
                  <p className="font-mono font-semibold text-navy-900">
                    ₹{Number(l.amountRequested).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-navy-600/60 text-xs">Tenure</p>
                  <p className="font-mono font-semibold text-navy-900">{l.tenureMonths} mo</p>
                </div>
                <div>
                  <p className="text-navy-600/60 text-xs">Rate</p>
                  <p className="font-mono font-semibold text-navy-900">{l.interestRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
