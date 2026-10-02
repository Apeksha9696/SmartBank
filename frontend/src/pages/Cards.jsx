import React, { useEffect, useState } from "react";
import { CreditCard, ShieldAlert } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DEBIT_VARIANTS = ["Classic", "Platinum"];
const CREDIT_VARIANTS = ["Silver", "Gold", "Platinum", "Signature"];

const statusColor = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  issued: "bg-emerald-50 text-emerald-700",
  rejected: "bg-maroon-50 text-maroon-700",
  blocked: "bg-navy-50 text-navy-500",
};

export default function Cards() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [cardCategory, setCardCategory] = useState("Debit");
  const [variant, setVariant] = useState(DEBIT_VARIANTS[0]);
  const [employmentType, setEmploymentType] = useState("Salaried");
  const [annualIncome, setAnnualIncome] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get("/cards/me");
    setCards(data.cards);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCategoryChange = (val) => {
    setCardCategory(val);
    setVariant(val === "Debit" ? DEBIT_VARIANTS[0] : CREDIT_VARIANTS[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const payload = { cardCategory, variant };
      if (cardCategory === "Credit") {
        payload.employmentType = employmentType;
        payload.annualIncome = Number(annualIncome);
      }
      const { data } = await api.post("/cards/apply", payload);
      setStatus({
        type: "success",
        message: data.card.status === "issued" ? "Your debit card has been issued." : "Application submitted for review.",
      });
      setAnnualIncome("");
      load();
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Application failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Topbar subtitle="Card services" title="Debit & Credit cards" />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-navy-800/5 shadow-card p-6 h-fit">
          <h2 className="font-display text-xl text-navy-900 mb-1">Apply for a card</h2>
          <p className="text-xs text-navy-600/60 mb-4 font-mono">
            debit cards issue instantly · credit cards need KYC & income review
          </p>

          {!user?.kycVerified && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
              <ShieldAlert size={14} className="mt-0.5 shrink-0" />
              <span>
                Your KYC isn't verified yet — you can still get a debit card, but credit card applications need a
                verified KYC. <a href="/kyc" className="underline font-semibold">Complete KYC</a>.
              </span>
            </div>
          )}

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
              <label className="block text-sm font-medium text-navy-800 mb-1">Card type</label>
              <div className="flex gap-2">
                {["Debit", "Credit"].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => handleCategoryChange(c)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      cardCategory === c
                        ? "bg-navy-900 text-parchment border-navy-900"
                        : "border-navy-800/15 text-navy-700 hover:bg-navy-50/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-1">Variant</label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm"
              >
                {(cardCategory === "Debit" ? DEBIT_VARIANTS : CREDIT_VARIANTS).map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            {cardCategory === "Credit" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1">Employment type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm"
                  >
                    {["Salaried", "Self-employed", "Student", "Other"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-800 mb-1">Annual income (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full rounded-lg border border-navy-800/15 px-3 py-2.5 text-sm font-mono"
                  />
                  <p className="text-[11px] text-navy-600/60 mt-1">
                    Students without income proof may prefer a card secured against a fixed deposit — ask support.
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Apply"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h2 className="font-display text-xl text-navy-900">Your cards</h2>
          {cards.length === 0 && (
            <p className="text-sm text-navy-600/70 bg-white rounded-xl border border-navy-800/5 p-6">
              No cards yet.
            </p>
          )}
          {cards.map((c) => (
            <div key={c._id} className="bg-white rounded-xl border border-navy-800/5 shadow-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="font-display text-lg text-navy-900">
                      {c.variant} {c.cardCategory}
                    </p>
                    <p className="text-xs text-navy-600/60 font-mono">
                      Applied {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full font-semibold ${statusColor[c.status]}`}>
                  {c.status}
                </span>
              </div>

              {c.status === "issued" ? (
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-navy-600/60 text-xs">Card number</p>
                    <p className="font-mono font-semibold text-navy-900">{c.maskedNumber}</p>
                  </div>
                  <div>
                    <p className="text-navy-600/60 text-xs">Expires</p>
                    <p className="font-mono font-semibold text-navy-900">
                      {String(c.expiryMonth).padStart(2, "0")}/{c.expiryYear}
                    </p>
                  </div>
                  {c.cardCategory === "Credit" && (
                    <div>
                      <p className="text-navy-600/60 text-xs">Credit limit</p>
                      <p className="font-mono font-semibold text-navy-900">
                        ₹{Number(c.creditLimit).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-navy-600/70">
                  {c.status === "pending" && "Awaiting review by the bank."}
                  {c.status === "rejected" && (c.remarks || "Application rejected.")}
                  {c.status === "blocked" && "This card has been blocked."}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
