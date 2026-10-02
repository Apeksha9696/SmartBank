import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Topbar from "../../components/Topbar";
import api from "../../api/adminAxios";

export default function AdminKycQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/kyc/queue");
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
      await api.patch(`/kyc/${id}/status`, { status, remarks });
      await load();
    } finally {
      setActingId(null);
    }
  };

  return (
    <AdminLayout>
      <Topbar subtitle="Admin desk" title="KYC review queue" />
      <p className="text-xs text-navy-600/60 font-mono mb-4">oldest submission first</p>

      {loading ? (
        <p className="text-sm text-navy-600/70 font-mono">loading queue…</p>
      ) : queue.length === 0 ? (
        <p className="text-sm text-navy-600/70 bg-white rounded-xl border border-navy-800/5 p-6">
          No pending KYC submissions.
        </p>
      ) : (
        <div className="grid gap-4">
          {queue.map((k) => (
            <div key={k._id} className="bg-white rounded-xl border border-navy-800/5 shadow-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <img src={k.photo} alt={k.fullName} className="h-14 w-14 rounded-lg object-cover border border-navy-800/10" />
                  <div>
                    <p className="font-display text-lg text-navy-900">{k.fullName}</p>
                    <p className="text-xs text-navy-600/60">{k.user?.email}</p>
                    <p className="text-xs text-navy-600/60 font-mono">PAN {k.panNumber} · Aadhaar •• {k.aadhaarLast4}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    disabled={actingId === k._id}
                    onClick={() => act(k._id, "verified")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-parchment hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Verify
                  </button>
                  <button
                    disabled={actingId === k._id}
                    onClick={() => act(k._id, "rejected")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-maroon-600 text-parchment hover:bg-maroon-700 disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-navy-600/60 text-xs">Occupation</p>
                  <p className="text-navy-900">{k.occupation}</p>
                </div>
                <div>
                  <p className="text-navy-600/60 text-xs">Annual income</p>
                  <p className="font-mono text-navy-900">₹{Number(k.annualIncome).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-navy-600/60 text-xs">Submitted</p>
                  <p className="font-mono text-navy-900">{new Date(k.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="sm:col-span-3">
                  <p className="text-navy-600/60 text-xs">Address</p>
                  <p className="text-navy-900">{k.currentAddress}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
