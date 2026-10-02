import React, { useState } from "react";
import { User as UserIcon, Copy, Check, Landmark, ShieldCheck } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";

function CopyableField({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-navy-600/70 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`text-sm font-semibold text-navy-900 ${mono ? "font-mono" : ""}`}>
          {value || "—"}
        </p>
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-navy-600/50 hover:text-maroon-600 transition-colors"
            title={`Copy ${label}`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, account } = useAuth();

  return (
    <DashboardLayout>
      <Topbar subtitle="Your details" title="Profile" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-navy-800/5 shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-maroon-50 text-maroon-600 flex items-center justify-center">
              <UserIcon size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl text-navy-900">{user?.fullName}</h2>
              <p className="text-xs text-navy-600/70 flex items-center gap-1">
                {user?.kycVerified ? (
                  <>
                    <ShieldCheck size={13} className="text-emerald-700" /> KYC verified
                  </>
                ) : (
                  "KYC pending"
                )}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <CopyableField label="Full name" value={user?.fullName} mono={false} />
            <CopyableField label="Email" value={user?.email} mono={false} />
            <CopyableField label="Phone" value={user?.phone} />
            <CopyableField
              label="Date of birth"
              value={user?.dob ? new Date(user.dob).toLocaleDateString("en-IN") : ""}
              mono={false}
            />
            <CopyableField label="Address" value={user?.address} mono={false} />
            <CopyableField label="PAN number" value={user?.panNumber} />
            <CopyableField label="Credit score" value={user?.creditScore} />
            <CopyableField
              label="Role"
              value={user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : ""}
              mono={false}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-navy-800/5 shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-10 w-10 rounded-lg bg-navy-900 text-gold-500 flex items-center justify-center">
              <Landmark size={18} />
            </div>
            <h2 className="font-display text-xl text-navy-900">Bank details</h2>
          </div>

          {account ? (
            <div className="space-y-5">
              <CopyableField label="Bank account ID" value={account._id} />
              <CopyableField label="Account number" value={account.accountNumber} />
              <CopyableField label="IFSC code" value={account.ifscCode} />
              <CopyableField label="Account type" value={account.accountType} mono={false} />
              <div>
                <p className="text-xs uppercase tracking-wide text-navy-600/70 mb-1">Status</p>
                <span className="inline-block text-[10px] uppercase tracking-wide bg-navy-50 text-navy-700 px-2 py-0.5 rounded-full">
                  {account.status}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-navy-600/70 mb-1">Balance</p>
                <p className="font-mono text-lg font-semibold text-navy-900">
                  ₹{Number(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-navy-600/70">
              No bank account found for your profile yet. Please contact support.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
