import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, subtitle }) {
  const { user, account } = useAuth();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-maroon-600 font-semibold mb-1">{subtitle}</p>
        <h1 className="font-display text-3xl text-navy-900">{title}</h1>
      </div>
      {account && (
        <Link
          to="/profile"
          className="flex items-center gap-3 bg-white rounded-xl shadow-card px-4 py-2.5 border border-navy-800/5 hover:-translate-y-0.5 transition-transform"
        >
          <div className="stamp h-11 w-11 text-[10px] leading-tight text-center">
            {account.accountType}
          </div>
          <div>
            <p className="text-[11px] text-navy-600/70 font-mono">A/C •• {account.accountNumber?.slice(-4)}</p>
            <p className="font-mono text-lg font-semibold text-navy-900">
              ₹{Number(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </Link>
      )}
      {user && !account && (
        <div className="text-sm text-navy-600">Welcome, {user.fullName?.split(" ")[0]}</div>
      )}
    </header>
  );
}
