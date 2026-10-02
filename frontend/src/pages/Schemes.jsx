import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import api from "../api/axios";

const categories = ["All", "Savings", "Fixed Deposit", "Recurring Deposit", "Loan"];

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await api.get("/schemes", category === "All" ? {} : { params: { category } });
      setSchemes(data.schemes);
      setLoading(false);
    }
    load();
  }, [category]);

  return (
    <DashboardLayout>
      <Topbar subtitle="Products" title="Schemes & products" />

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === c
                ? "bg-maroon-600 border-maroon-600 text-parchment"
                : "bg-white border-navy-800/10 text-navy-700 hover:border-maroon-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-navy-600/70 font-mono">loading schemes…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {schemes.map((s) => (
            <div key={s.code} className="bg-white rounded-xl border border-navy-800/5 shadow-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wide bg-gold-500/15 text-gold-600 px-2 py-0.5 rounded-full font-semibold">
                  {s.category}
                </span>
                <span className="font-mono text-xs text-navy-600/50">{s.code}</span>
              </div>
              <h3 className="font-display text-lg text-navy-900 mb-1">{s.name}</h3>
              <p className="text-sm text-navy-600/80 mb-4 flex-1">{s.description}</p>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div>
                  <p className="text-navy-600/50">Interest</p>
                  <p className="font-mono font-semibold text-navy-900">{s.interestRate}</p>
                </div>
                <div>
                  <p className="text-navy-600/50">Tenure</p>
                  <p className="font-mono font-semibold text-navy-900">{s.tenure}</p>
                </div>
                <div>
                  <p className="text-navy-600/50">Min amount</p>
                  <p className="font-mono font-semibold text-navy-900">₹{s.minAmount?.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-navy-600/50">Eligibility</p>
                  <p className="text-navy-800 leading-snug">{s.eligibility}</p>
                </div>
              </div>

              {s.highlights?.length > 0 && (
                <ul className="text-xs text-navy-600/80 space-y-1 border-t border-navy-800/5 pt-3">
                  {s.highlights.map((h) => (
                    <li key={h} className="flex gap-1.5">
                      <span className="text-gold-600">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
