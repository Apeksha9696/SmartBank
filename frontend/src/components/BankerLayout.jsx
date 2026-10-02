import React from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, LogOut } from "lucide-react";
import { useBankerAuth } from "../context/BankerAuthContext";

export default function BankerLayout({ children }) {
  const { banker, logout } = useBankerAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/banker/login");
  };

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-navy-900 text-parchment">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gold-500 flex items-center justify-center font-display font-bold text-navy-900">
              <Landmark size={16} />
            </div>
            <div>
              <p className="font-display text-lg leading-none">SmartBank</p>
              <p className="text-[11px] uppercase tracking-widest text-navy-200">Banker desk</p>
            </div>
          </div>
          {banker && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium leading-none">{banker.fullName}</p>
                <p className="text-[11px] font-mono text-navy-200 mt-1">{banker.bankerId}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-semibold text-navy-200 hover:text-parchment px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 md:px-10 py-8">{children}</main>
    </div>
  );
}
