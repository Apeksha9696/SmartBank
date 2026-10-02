import React from "react";
import { Navigate } from "react-router-dom";
import { useBankerAuth } from "../context/BankerAuthContext";

export default function BankerProtectedRoute({ children }) {
  const { banker, loading } = useBankerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <p className="font-mono text-sm text-navy-600">loading banker session…</p>
      </div>
    );
  }

  if (!banker) return <Navigate to="/banker/login" replace />;

  return children;
}
