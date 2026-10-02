import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Topbar from "../../components/Topbar";
import api from "../../api/adminAxios";

export default function AdminLoanQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/loans/queue");
    setQueue(data.queue);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/loans/${id}/status`, { status });
    load();
  };

  return (
    <AdminLayout>
      <Topbar subtitle="Admin desk" title="Loan processing queue" />
      <p className="text-xs text-navy-600/60 font-mono mb-4">
        ranked by a max-heap priority queue on credit score & income-to-loan ratio — highest priority first
      </p>

      {loading ? (
        <p className="text-sm text-navy-600/70 font-mono">building heap…</p>
      ) : queue.length === 0 ? (
        <p className="text-sm text-navy-600/70 bg-white rounded-xl border border-navy-800/5 p-6">
          No pending applications.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-navy-800/5 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-navy-600/60 bg-navy-50/40">
                <th className="px-5 py-3 font-medium">Rank</th>
                <th className="px-5 py-3 font-medium">Applicant</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Priority score</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/5">
              {queue.map((l) => (
                <tr key={l._id} className="hover:bg-parchment/60">
                  <td className="px-5 py-3 font-mono font-semibold text-maroon-700">#{l.rank}</td>
                  <td className="px-5 py-3">
                    <p className="text-navy-900 font-medium">{l.user?.fullName}</p>
                    <p className="text-xs text-navy-600/60">{l.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-navy-800">{l.loanType}</td>
                  <td className="px-5 py-3 text-right font-mono text-navy-900">
                    ₹{Number(l.amountRequested).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-navy-900">{l.priorityScore}</td>
                  <td className="px-5 py-3 capitalize text-navy-700">{l.status}</td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      onClick={() => updateStatus(l._id, "approved")}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(l._id, "rejected")}
                      className="text-xs font-semibold text-maroon-700 hover:underline"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
