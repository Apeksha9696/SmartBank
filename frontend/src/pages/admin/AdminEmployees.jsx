import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../api/adminAxios";
import { Copy, CheckCircle2, Trash2, PencilLine, X, Check } from "lucide-react";

const DESIGNATIONS = ["Loan Officer", "Branch Manager", "Credit Analyst", "Relationship Manager"];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="ml-2 text-navy-400 hover:text-gold-500 transition-colors">
      {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
}

export default function AdminEmployees() {
  const [bankers, setBankers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fullName: "", email: "", branch: "", designation: "Loan Officer" });
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newBanker, setNewBanker] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/banker/admin/employees");
      setBankers(data.bankers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    try {
      const { data } = await api.post("/banker/admin/employees", form);
      setNewBanker(data.banker);
      setForm({ fullName: "", email: "", branch: "", designation: "Loan Officer" });
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create employee");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this banker?")) return;
    await api.delete(`/banker/admin/employees/${id}`);
    await load();
  };

  const startEdit = (b) => {
    setEditId(b._id);
    setEditData({ fullName: b.fullName, email: b.email, branch: b.branch, designation: b.designation, active: b.active });
  };

  const saveEdit = async (id) => {
    await api.patch(`/banker/admin/employees/${id}`, editData);
    setEditId(null);
    await load();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-maroon-600 font-semibold mb-1">Admin desk</p>
        <h1 className="font-display text-3xl text-navy-900">Employee Management</h1>
        <p className="text-xs text-navy-600/60 font-mono mt-1">create banker accounts — each gets a unique ID to log in with their email</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-navy-800/5 shadow-card p-6 mb-8">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">Add New Employee</h2>
        {formError && (
          <div className="text-sm bg-maroon-50 border border-maroon-100 text-maroon-700 px-3 py-2 rounded-lg mb-4">{formError}</div>
        )}
        {newBanker && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4">
            <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">{newBanker.fullName} added successfully</p>
              <p className="text-xs text-emerald-700 mt-1">
                Banker ID: <span className="font-mono font-bold">{newBanker.bankerId}</span>
                <CopyBtn text={newBanker.bankerId} />
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">Share this ID + their email so they can log in.</p>
            </div>
            <button onClick={() => setNewBanker(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><X size={16} /></button>
          </div>
        )}
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">Full Name</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2 bg-white focus:border-maroon-600 outline-none text-sm"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">Work Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2 bg-white focus:border-maroon-600 outline-none text-sm"
              placeholder="jane@bank.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">Branch</label>
            <input
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2 bg-white focus:border-maroon-600 outline-none text-sm"
              placeholder="Main Branch"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">Designation</label>
            <select
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="w-full rounded-lg border border-navy-800/15 px-3 py-2 bg-white focus:border-maroon-600 outline-none text-sm"
            >
              {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="bg-maroon-600 hover:bg-maroon-700 text-parchment text-sm font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>

      {/* Employee table */}
      <div className="bg-white rounded-xl border border-navy-800/5 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-navy-800/5">
          <h2 className="text-sm font-semibold text-navy-800">All Employees ({bankers.length})</h2>
        </div>
        {loading ? (
          <p className="text-sm text-navy-600/70 font-mono p-6">Loading…</p>
        ) : bankers.length === 0 ? (
          <p className="text-sm text-navy-600/70 p-6">No employees yet. Add one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-navy-600/60 bg-navy-50/40">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Banker ID</th>
                  <th className="px-5 py-3 font-medium">Branch</th>
                  <th className="px-5 py-3 font-medium">Designation</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/5">
                {bankers.map((b) => (
                  <tr key={b._id} className="hover:bg-parchment/60">
                    <td className="px-5 py-3">
                      {editId === b._id ? (
                        <input
                          value={editData.fullName}
                          onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                          className="rounded border border-navy-800/20 px-2 py-1 text-sm w-32"
                        />
                      ) : (
                        <span className="font-medium text-navy-900">{b.fullName}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-navy-700">
                      {editId === b._id ? (
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="rounded border border-navy-800/20 px-2 py-1 text-sm w-40"
                        />
                      ) : b.email}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-maroon-700 font-semibold">{b.bankerId}</span>
                      <CopyBtn text={b.bankerId} />
                    </td>
                    <td className="px-5 py-3 text-navy-700">
                      {editId === b._id ? (
                        <input
                          value={editData.branch}
                          onChange={(e) => setEditData({ ...editData, branch: e.target.value })}
                          className="rounded border border-navy-800/20 px-2 py-1 text-sm w-28"
                        />
                      ) : (b.branch || "—")}
                    </td>
                    <td className="px-5 py-3 text-navy-700">
                      {editId === b._id ? (
                        <select
                          value={editData.designation}
                          onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                          className="rounded border border-navy-800/20 px-2 py-1 text-sm"
                        >
                          {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      ) : b.designation}
                    </td>
                    <td className="px-5 py-3">
                      {editId === b._id ? (
                        <select
                          value={editData.active ? "active" : "inactive"}
                          onChange={(e) => setEditData({ ...editData, active: e.target.value === "active" })}
                          className="rounded border border-navy-800/20 px-2 py-1 text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {b.active ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      {editId === b._id ? (
                        <>
                          <button onClick={() => saveEdit(b._id)} className="text-emerald-600 hover:text-emerald-800"><Check size={16} /></button>
                          <button onClick={() => setEditId(null)} className="text-navy-400 hover:text-navy-700"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(b)} className="text-navy-400 hover:text-maroon-600"><PencilLine size={15} /></button>
                          <button onClick={() => handleDelete(b._id)} className="text-navy-400 hover:text-red-600"><Trash2 size={15} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
