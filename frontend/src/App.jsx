import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import Loans from "./pages/Loans";
import Kyc from "./pages/Kyc";
import Cards from "./pages/Cards";
import Schemes from "./pages/Schemes";
import Support from "./pages/Support";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminEmployees from "./pages/admin/AdminEmployees";
import BankerLogin from "./pages/banker/BankerLogin";
import BankerDashboard from "./pages/banker/BankerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import BankerProtectedRoute from "./components/BankerProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import OAuthCallback from "./pages/OAuthCallback";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
      <Route path="/kyc" element={<ProtectedRoute><Kyc /></ProtectedRoute>} />
      <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
      <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<Navigate to="/admin/employees" replace />} />
      <Route
        path="/admin/employees"
        element={
          <AdminProtectedRoute>
            <AdminEmployees />
          </AdminProtectedRoute>
        }
      />

      <Route path="/banker/login" element={<BankerLogin />} />
      <Route
        path="/banker/dashboard"
        element={
          <BankerProtectedRoute>
            <BankerDashboard />
          </BankerProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
