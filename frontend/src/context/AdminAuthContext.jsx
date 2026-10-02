import React, { createContext, useContext, useEffect, useState } from "react";
import adminApi from "../api/adminAxios";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    const token = localStorage.getItem("smartbank_admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await adminApi.get("/auth/me");
      if (data.user?.role !== "admin") throw new Error("not admin");
      setAdmin(data.user);
    } catch (err) {
      localStorage.removeItem("smartbank_admin_token");
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const { data } = await adminApi.post("/auth/admin-login", {
      email: email.trim().toLowerCase(),
      password,
    });
    localStorage.setItem("smartbank_admin_token", data.token);
    setAdmin(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("smartbank_admin_token");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
