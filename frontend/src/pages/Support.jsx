import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import api from "../api/axios";

const categories = ["Account", "Card", "Loan", "Transaction", "Other"];

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "", category: "Account" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    const { data } = await api.get("/support/me");
    setTickets(data.tickets);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const { data } = await api.post("/support", form);
      setStatus({ type: "success", message: `Ticket raised — position #${data.ticket.queuePosition} in the support queue.` });
      setForm({ subject: "", message: "", category: "Account" });
      loadTickets();
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Could not raise ticket." });
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    queued: "bg-navy-50 text-navy-700",
    "in-progress": "bg-amber-50 text-amber-700",
    resolved: "bg-emerald-50 text-emerald-700",
  };

  return (
    <DashboardLayout>
      <Topbar subtitle="We're here to help" title="Customer support" />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-navy-800/5 shadow-card p-6 h-fit">
          <h2 className="font-display text-xl text-navy-900 mb-1">Raise a ticket</h2>
          <p className="text-xs text-navy-600/60 mb-4 font-mono">served FIFO via a support queue</p>
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
              <label className="block text-sm font-medium text-navy-800 mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Subject</label>
              <input
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Message</label>
              <textarea
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={handleChange}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Raise ticket"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h2 className="font-display text-xl text-navy-900">Your tickets</h2>
          {tickets.length === 0 && (
            <p className="text-sm text-navy-600/70 bg-white rounded-xl border border-navy-800/5 p-6">No tickets yet.</p>
          )}
          {tickets.map((t) => (
            <div key={t._id} className="bg-white rounded-xl border border-navy-800/5 shadow-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-lg text-navy-900">{t.subject}</p>
                  <p className="text-xs text-navy-600/60 font-mono">{t.category}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full font-semibold ${statusColor[t.status]}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-sm text-navy-600/80 mt-2">{t.message}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
