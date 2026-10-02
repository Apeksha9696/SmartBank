import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Landmark,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  User,
  FileCheck2,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/kyc", label: "KYC", icon: FileCheck2 },
  { to: "/cards", label: "Cards", icon: CreditCard },
  { to: "/transfer", label: "Transfer & Deposit", icon: ArrowLeftRight },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/loans", label: "Loans", icon: Landmark },
  { to: "/schemes", label: "Schemes", icon: ShieldCheck },
  { to: "/support", label: "Support", icon: LifeBuoy },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-navy-900 text-parchment min-h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gold-500 flex items-center justify-center font-display font-bold text-navy-900">S</div>
          <div>
            <p className="font-display text-lg leading-none">SmartBank</p>
            <p className="text-[11px] uppercase tracking-widest text-navy-200">est. in code</p>
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
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-navy-200 hover:bg-white/5 hover:text-parchment transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
