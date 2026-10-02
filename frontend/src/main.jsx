import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BankerAuthProvider } from "./context/BankerAuthContext.jsx";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BankerAuthProvider>
          <AdminAuthProvider>
            <App />
          </AdminAuthProvider>
        </BankerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
