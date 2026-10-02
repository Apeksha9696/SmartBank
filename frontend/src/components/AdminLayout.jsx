import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Users, LogOut } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const navItems = [
  { to: "/admin/employees", label: "Employees", icon: Users },
];

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-parchment">
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-navy-900 text-parchment min-h-screen sticky top-0">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gold-500 flex items-center justify-center font-display font-bold text-navy-900">
              A
            </div>
            <div>
              <p className="font-display text-lg leading-none">SmartBank</p>
              <p className="text-[11px] uppercase tracking-widest text-navy-200">Admin portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gold-500 text-navy-900 font-semibold"
                    : "text-navy-200 hover:bg-white/5 hover:text-parchment"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          {admin && (
            <p className="px-3 pb-2 text-xs text-navy-300 truncate">{admin.fullName}</p>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy-200 hover:bg-white/5 hover:text-parchment transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-6 md:px-10 py-8 max-w-6xl">{children}</main>
    </div>
  );
}
