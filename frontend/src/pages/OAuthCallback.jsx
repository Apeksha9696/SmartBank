import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      loginWithToken(token).then(() => navigate("/dashboard")).catch(() => navigate("/login?error=oauth"));
    } else {
      navigate("/login?error=oauth");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono text-sm text-navy-600">Signing you in…</p>
    </div>
  );
}
