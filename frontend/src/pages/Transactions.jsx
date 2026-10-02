import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import api from "../api/axios";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const downloadStatement = async () => {
    setDownloading(true);
    try {
      const { data } = await api.get("/transactions/statement/download", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "smartbank-statement.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get("/transactions", { params: { sortBy, order } });
        setTransactions(data.transactions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sortBy, order]);

  return (
    <DashboardLayout>
      <Topbar subtitle="Full ledger" title="Transaction history" />

      <div className="flex justify-end mb-4">
        <button
          onClick={downloadStatement}
          disabled={downloading}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg bg-navy-900 text-parchment hover:bg-navy-800 transition-colors disabled:opacity-60"
        >
          <Download size={16} />
          {downloading ? "Preparing…" : "Download statement (PDF)"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-navy-800/5 shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-navy-800/5">
          <span className="text-xs font-semibold text-navy-600/70 uppercase tracking-wide">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-navy-800/15 rounded-lg px-2.5 py-1.5"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="text-sm border border-navy-800/15 rounded-lg px-2.5 py-1.5"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <span className="ml-auto text-xs text-navy-600/60 font-mono">
            sorted with merge sort · O(n log n)
          </span>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-navy-600/70 font-mono">reading ledger…</p>
        ) : transactions.length === 0 ? (
          <p className="p-6 text-sm text-navy-600/70">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-navy-600/60 bg-navy-50/40">
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Note</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Balance after</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/5">
              {transactions.map((t) => (
                <tr key={t._id} className="hover:bg-parchment/60">
                  <td className="px-5 py-3 capitalize text-navy-900">{t.type.replace("-", " ")}</td>
                  <td className="px-5 py-3 text-navy-600/80">{t.note || "—"}</td>
                  <td className="px-5 py-3 text-navy-600/70 font-mono text-xs">
                    {new Date(t.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-mono font-semibold ${
                      t.type.includes("in") || t.type === "deposit" ? "text-emerald-700" : "text-maroon-700"
                    }`}
                  >
                    {t.type.includes("in") || t.type === "deposit" ? "+" : "−"}₹
                    {Number(t.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-navy-800">
                    ₹{Number(t.balanceAfter).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
