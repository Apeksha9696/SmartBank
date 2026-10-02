import React, { createContext, useContext, useEffect, useState } from "react";
import bankerApi from "../api/bankerAxios";

const BankerAuthContext = createContext(null);

export function BankerAuthProvider({ children }) {
  const [banker, setBanker] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    const token = localStorage.getItem("smartbank_banker_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await bankerApi.get("/banker/me");
      setBanker(data.banker);
    } catch (err) {
      localStorage.removeItem("smartbank_banker_token");
      setBanker(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, bankerId) => {
    const { data } = await bankerApi.post("/banker/login", { email, bankerId });
    localStorage.setItem("smartbank_banker_token", data.token);
    setBanker(data.banker);
    return data.banker;
  };

  const logout = () => {
    localStorage.removeItem("smartbank_banker_token");
    setBanker(null);
  };

  return (
    <BankerAuthContext.Provider value={{ banker, loading, login, logout }}>
      {children}
    </BankerAuthContext.Provider>
  );
}

export function useBankerAuth() {
  const ctx = useContext(BankerAuthContext);
  if (!ctx) throw new Error("useBankerAuth must be used within BankerAuthProvider");
  return ctx;
}
