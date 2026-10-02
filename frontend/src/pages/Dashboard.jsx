import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownToLine, ArrowUpFromLine, Send, Landmark } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, account } = useAuth();
  const [recent, setRecent] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [txnRes, loanRes] = await Promise.all([
          api.get("/transactions", { params: { sortBy: "date", order: "desc" } }),
          api.get("/loans/me"),
        ]);
        setRecent(txnRes.data.transactions.slice(0, 5));
        setLoans(loanRes.data.loans.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const quickActions = [
    { to: "/transfer?tab=deposit", label: "Deposit", icon: ArrowDownToLine },
    { to: "/transfer?tab=withdraw", label: "Withdraw", icon: ArrowUpFromLine },
    { to: "/transfer?tab=transfer", label: "Transfer", icon: Send },
    { to: "/loans", label: "Apply for a loan", icon: Landmark },
  ];

  return (
    <DashboardLayout>
      <Topbar subtitle="Passbook overview" title={`Good to see you, ${user?.fullName?.split(" ")[0] || ""}`} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-xl border border-navy-800/5 shadow-card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
          >
            <div className="h-10 w-10 rounded-lg bg-maroon-50 text-maroon-600 flex items-center justify-center">
              <Icon size={18} />
            </div>
            <span className="text-sm font-medium text-navy-900">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-navy-800/5 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-navy-900">Recent entries</h2>
            <Link to="/transactions" className="text-xs font-semibold text-maroon-600 hover:underline">
              View full ledger
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-navy-600/70 font-mono">reading ledger…</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-navy-600/70">No transactions yet. Make your first deposit to get started.</p>
          ) : (
            <div className="divide-y divide-navy-800/5 bg-ledger -mx-2">
              {recent.map((t) => (
                <div key={t._id} className="flex items-center justify-between px-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-navy-900 capitalize">{t.type.replace("-", " ")}</p>
                    <p className="text-xs text-navy-600/70">{new Date(t.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <p
                    className={`font-mono text-sm font-semibold ${
                      t.type.includes("in") || t.type === "deposit" ? "text-emerald-700" : "text-maroon-700"
                    }`}
                  >
                    {t.type.includes("in") || t.type === "deposit" ? "+" : "−"}₹
                    {Number(t.amount).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-navy-800/5 shadow-card p-6">
          <h2 className="font-display text-xl text-navy-900 mb-4">Loan applications</h2>
          {loans.length === 0 ? (
            <p className="text-sm text-navy-600/70">
              No loans yet. Browse{" "}
              <Link to="/schemes" className="text-maroon-600 font-semibold hover:underline">
                schemes
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {loans.map((l) => (
                <div key={l._id} className="border border-navy-800/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-navy-900">{l.loanType} Loan</p>
                    <span className="text-[10px] uppercase tracking-wide bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">
                      {l.status}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-navy-700 mt-1">
                    ₹{Number(l.amountRequested).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/loans"
            className="mt-4 inline-block text-xs font-semibold text-maroon-600 hover:underline"
          >
            Apply for a new loan →
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
