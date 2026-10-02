import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    const token = localStorage.getItem("smartbank_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      const accRes = await api.get("/accounts/me");
      setAccount(accRes.data.account);
    } catch (err) {
      localStorage.removeItem("smartbank_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email: email.trim().toLowerCase(), password });
    localStorage.setItem("smartbank_token", data.token);
    setUser(data.user);
    const accRes = await api.get("/accounts/me");
    setAccount(accRes.data.account);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("smartbank_token", data.token);
    setUser(data.user);
    setAccount(data.account);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("smartbank_token");
    setUser(null);
    setAccount(null);
  };

  const loginWithToken = async (token) => {
    localStorage.setItem("smartbank_token", token);
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    const accRes = await api.get("/accounts/me");
    setAccount(accRes.data.account);
  };

  const refreshAccount = async () => {
    const accRes = await api.get("/accounts/me");
    setAccount(accRes.data.account);
  };

  return (
    <AuthContext.Provider value={{ user, account, loading, login, register, logout, loginWithToken, refreshAccount, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
