import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Topbar from "../../components/Topbar";
import api from "../../api/adminAxios";

export default function AdminCardQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/cards/queue");
    setQueue(data.queue);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id, status) => {
    setActingId(id);
    try {
      const remarks = status === "rejected" ? window.prompt("Reason for rejection (optional)") || "" : "";
      await api.patch(`/cards/${id}/status`, { status, remarks });
      await load();
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminLayout>
      <Topbar subtitle="Admin desk" title="Credit card review queue" />
      <p className="text-xs text-navy-600/60 font-mono mb-4">
        approving generates the card number, CVV & expiry and issues it immediately
      </p>

      {loading ? (
        <p className="text-sm text-navy-600/70 font-mono">loading queue…</p>
      ) : queue.length === 0 ? (
        <p className="text-sm text-navy-600/70 bg-white rounded-xl border border-navy-800/5 p-6">
          No pending credit card applications.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-navy-800/5 shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-navy-600/60 bg-navy-50/40">
                <th className="px-5 py-3 font-medium">Applicant</th>
                <th className="px-5 py-3 font-medium">Variant</th>
                <th className="px-5 py-3 font-medium">Employment</th>
                <th className="px-5 py-3 font-medium text-right">Annual income</th>
                <th className="px-5 py-3 font-medium text-right">Proposed limit</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/5">
              {queue.map((c) => (
                <tr key={c._id} className="hover:bg-parchment/60">
                  <td className="px-5 py-3">
                    <p className="text-navy-900 font-medium">{c.user?.fullName}</p>
                    <p className="text-xs text-navy-600/60">{c.user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-navy-800">{c.variant}</td>
                  <td className="px-5 py-3 text-navy-800">{c.employmentType}</td>
                  <td className="px-5 py-3 text-right font-mono text-navy-900">
                    ₹{Number(c.annualIncome).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-navy-900">
                    ₹{Number(c.creditLimit).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      disabled={actingId === c._id}
                      onClick={() => act(c._id, "approved")}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-parchment hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      disabled={actingId === c._id}
                      onClick={() => act(c._id, "rejected")}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-maroon-600 text-parchment hover:bg-maroon-700 disabled:opacity-60"
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
