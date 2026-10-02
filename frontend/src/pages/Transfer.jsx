import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowDownToLine, ArrowUpFromLine, Send } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { id: "deposit", label: "Deposit", icon: ArrowDownToLine },
  { id: "withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { id: "transfer", label: "Transfer", icon: Send },
];

export default function Transfer() {
  const { refreshAccount } = useAuth();
  const [params, setParams] = useSearchParams();
  const activeTab = params.get("tab") || "deposit";
  const [form, setForm] = useState({ amount: "", note: "", toAccountNumber: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const switchTab = (id) => {
    setStatus(null);
    setParams({ tab: id });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      let res;
      if (activeTab === "deposit") {
        res = await api.post("/accounts/deposit", { amount: Number(form.amount), note: form.note });
      } else if (activeTab === "withdraw") {
        res = await api.post("/accounts/withdraw", { amount: Number(form.amount), note: form.note });
      } else {
        res = await api.post("/accounts/transfer", {
          amount: Number(form.amount),
          note: form.note,
          toAccountNumber: form.toAccountNumber,
        });
      }
      await refreshAccount();
      setStatus({ type: "success", message: "Success.", data: res.data });
      setForm({ amount: "", note: "", toAccountNumber: "" });
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Topbar subtitle="Move money" title="Deposit, withdraw & transfer" />

      <div className="bg-white rounded-xl border border-navy-800/5 shadow-card max-w-xl">
        <div className="flex border-b border-navy-800/5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "text-maroon-700 border-b-2 border-maroon-600"
                  : "text-navy-600/70 hover:text-navy-900"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {status && (
            <div
              className={`text-sm px-3 py-2 rounded-lg border ${
                status.type === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-maroon-50 border-maroon-100 text-maroon-700"
              }`}
            >
              {status.message}
              {status.data?.fraudCheck?.flagged && (
                <p className="mt-1 font-mono text-xs">
                  ⚠ Circular transfer pattern detected across recent transfers — flagged for review.
                </p>
              )}
            </div>
          )}

          {activeTab === "transfer" && (
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Recipient account number</label>
              <input
                name="toAccountNumber"
                required
                value={form.toAccountNumber}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm font-mono"
                placeholder="12-digit account number"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              min="1"
              step="0.01"
              required
              value={form.amount}
              onChange={handleChange}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm font-mono"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-800 mb-1">Note (optional)</label>
            <input
              name="note"
              value={form.note}
              onChange={handleChange}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 bg-white focus:border-maroon-600 outline-none text-sm"
              placeholder="e.g. Rent, Groceries…"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? "Processing…" : `Confirm ${activeTab}`}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
