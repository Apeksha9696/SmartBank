import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, UploadCloud } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Topbar from "../components/Topbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  fullName: "",
  dob: "",
  gender: "Male",
  maritalStatus: "Single",
  permanentAddress: "",
  currentAddress: "",
  sameAsPermanent: false,
  occupation: "",
  annualIncome: "",
  panNumber: "",
  aadhaarNumber: "",
  photo: "",
  signature: "",
  nomineeName: "",
  nomineeRelation: "",
  nomineeDob: "",
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const statusMeta = {
  verified: { icon: ShieldCheck, label: "KYC verified", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  pending: { icon: ShieldQuestion, label: "Under review", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  rejected: { icon: ShieldAlert, label: "Rejected — please resubmit", cls: "bg-maroon-50 text-maroon-700 border-maroon-100" },
};

export default function Kyc() {
  const { refreshAccount } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [kyc, setKyc] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get("/kyc/me");
    if (data.kyc) {
      setKyc(data.kyc);
      setForm((f) => ({
        ...f,
        fullName: data.kyc.fullName || "",
        dob: data.kyc.dob ? data.kyc.dob.slice(0, 10) : "",
        gender: data.kyc.gender || "Male",
        maritalStatus: data.kyc.maritalStatus || "Single",
        permanentAddress: data.kyc.permanentAddress || "",
        currentAddress: data.kyc.currentAddress || "",
        sameAsPermanent: !!data.kyc.sameAsPermanent,
        occupation: data.kyc.occupation || "",
        annualIncome: data.kyc.annualIncome || "",
        panNumber: data.kyc.panNumber || "",
        nomineeName: data.kyc.nominee?.name || "",
        nomineeRelation: data.kyc.nominee?.relation || "",
        nomineeDob: data.kyc.nominee?.dob ? data.kyc.nominee.dob.slice(0, 10) : "",
      }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => {
      const next = { ...f, [name]: type === "checkbox" ? checked : value };
      if (name === "sameAsPermanent" && checked) next.currentAddress = f.permanentAddress;
      if (name === "permanentAddress" && f.sameAsPermanent) next.currentAddress = value;
      return next;
    });
  };

  const handleFile = async (e) => {
    const { name, files } = e.target;
    if (!files?.[0]) return;
    const dataUrl = await fileToDataUrl(files[0]);
    setForm((f) => ({ ...f, [name]: dataUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await api.post("/kyc/submit", {
        ...form,
        annualIncome: Number(form.annualIncome),
        nominee: {
          name: form.nomineeName,
          relation: form.nomineeRelation,
          dob: form.nomineeDob || undefined,
        },
      });
      setStatus({ type: "success", message: "KYC submitted for verification." });
      await load();
      await refreshAccount();
    } catch (err) {
      setStatus({ type: "error", message: err?.response?.data?.message || "Submission failed." });
    } finally {
      setLoading(false);
    }
  };

  const meta = kyc ? statusMeta[kyc.status] : null;
  const Icon = meta?.icon;

  return (
    <DashboardLayout>
      <Topbar subtitle="Identity verification" title="Complete your KYC" />

      {meta && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border mb-6 ${meta.cls}`}>
          <Icon size={16} />
          <span className="font-semibold">{meta.label}</span>
          {kyc.status === "rejected" && kyc.remarks && (
            <span className="text-xs opacity-80">— {kyc.remarks}</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-navy-800/5 shadow-card p-6 space-y-8 max-w-4xl">
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

        <section>
          <h2 className="font-display text-lg text-navy-900 mb-4">Personal details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full name (as per PAN)">
              <input name="fullName" required value={form.fullName} onChange={handleChange} className="input" />
            </Field>
            <Field label="Date of birth">
              <input type="date" name="dob" required value={form.dob} onChange={handleChange} className="input" />
            </Field>
            <Field label="Gender">
              <select name="gender" value={form.gender} onChange={handleChange} className="input">
                {["Male", "Female", "Other"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Marital status">
              <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="input">
                {["Single", "Married", "Divorced", "Widowed"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-navy-900 mb-4">Address</h2>
          <div className="grid gap-4">
            <Field label="Permanent address">
              <textarea name="permanentAddress" required rows={2} value={form.permanentAddress} onChange={handleChange} className="input" />
            </Field>
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input type="checkbox" name="sameAsPermanent" checked={form.sameAsPermanent} onChange={handleChange} />
              Current address same as permanent
            </label>
            <Field label="Current address">
              <textarea
                name="currentAddress"
                required
                rows={2}
                disabled={form.sameAsPermanent}
                value={form.currentAddress}
                onChange={handleChange}
                className="input disabled:opacity-60"
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-navy-900 mb-4">Occupation & income</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Occupation">
              <input name="occupation" required value={form.occupation} onChange={handleChange} className="input" />
            </Field>
            <Field label="Annual income (₹)">
              <input type="number" name="annualIncome" required min="0" value={form.annualIncome} onChange={handleChange} className="input font-mono" />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-navy-900 mb-4">Identity documents</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="PAN number">
              <input
                name="panNumber"
                required
                placeholder="ABCDE1234F"
                maxLength={10}
                value={form.panNumber}
                onChange={(e) => handleChange({ target: { name: "panNumber", value: e.target.value.toUpperCase() } })}
                className="input font-mono uppercase"
              />
            </Field>
            <Field label="Aadhaar number">
              <input
                name="aadhaarNumber"
                required
                placeholder="12-digit Aadhaar"
                maxLength={12}
                value={form.aadhaarNumber}
                onChange={handleChange}
                className="input font-mono"
              />
            </Field>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-navy-900 mb-4">Photo & signature</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <FileField label="Passport-size photo" name="photo" onChange={handleFile} preview={form.photo} required={!kyc} />
            <FileField label="Signature" name="signature" onChange={handleFile} preview={form.signature} required={!kyc} />
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-navy-900 mb-1">Nominee details</h2>
          <p className="text-xs text-navy-600/60 mb-4">Optional, but recommended.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Nominee name">
              <input name="nomineeName" value={form.nomineeName} onChange={handleChange} className="input" />
            </Field>
            <Field label="Relation">
              <input name="nomineeRelation" value={form.nomineeRelation} onChange={handleChange} className="input" />
            </Field>
            <Field label="Nominee DOB">
              <input type="date" name="nomineeDob" value={form.nomineeDob} onChange={handleChange} className="input" />
            </Field>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-maroon-600 hover:bg-maroon-700 text-parchment font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? "Submitting…" : kyc ? "Resubmit KYC" : "Submit KYC"}
        </button>
      </form>

      <style>{`.input { width:100%; border:1px solid rgba(15,30,60,0.15); border-radius:0.5rem; padding:0.6rem 0.75rem; font-size:0.875rem; }`}</style>
    </DashboardLayout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-800 mb-1">{label}</label>
      {children}
    </div>
  );
}

function FileField({ label, name, onChange, preview, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-800 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {preview ? (
          <img src={preview} alt={label} className="h-14 w-14 rounded-lg object-cover border border-navy-800/10" />
        ) : (
          <div className="h-14 w-14 rounded-lg border border-dashed border-navy-800/20 flex items-center justify-center text-navy-600/40">
            <UploadCloud size={18} />
          </div>
        )}
        <input type="file" name={name} accept="image/*" required={required} onChange={onChange} className="text-xs" />
      </div>
    </div>
  );
}
