import React, { useEffect, useState } from "react";
import BankerLayout from "../../components/BankerLayout";
import bankerApi from "../../api/bankerAxios";
import { useBankerAuth } from "../../context/BankerAuthContext";

export default function BankerDashboard() {
  const { banker } = useBankerAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await bankerApi.get("/banker/loans/queue");
    setQueue(data.queue);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setActingId(id);
    try {
      await bankerApi.patch(`/banker/loans/${id}/status`, { status });
      await load();
    } finally {
      setActingId(null);
    }
  };

  return (
    <BankerLayout>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-maroon-600 font-semibold mb-1">Banker desk</p>
        <h1 className="font-display text-3xl text-navy-900">
          Welcome, {banker?.fullName?.split(" ")[0] || "banker"}
        </h1>
        <p className="text-xs text-navy-600/60 font-mono mt-2">
          loan requests submitted by customers, ranked by priority — approve or reject each below
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-navy-600/70 font-mono">loading queue…</p>
      ) : queue.length === 0 ? (
        <p className="text-sm text-navy-600/70 bg-white rounded-xl border border-navy-800/5 p-6">
          No pending applications right now.
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
                      disabled={actingId === l._id}
                      onClick={() => updateStatus(l._id, "approved")}
                      className="text-xs font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={actingId === l._id}
                      onClick={() => updateStatus(l._id, "rejected")}
                      className="text-xs font-semibold text-maroon-700 hover:underline disabled:opacity-50"
                    >
                      Disapprove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </BankerLayout>
  );
}
