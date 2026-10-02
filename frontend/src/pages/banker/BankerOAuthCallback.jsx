import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBankerAuth } from "../../context/BankerAuthContext";

export default function BankerOAuthCallback() {
  const { loginWithToken } = useBankerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      loginWithToken(token)
        .then(() => navigate("/banker/dashboard"))
        .catch(() => navigate("/banker/login?error=oauth"));
    } else {
      navigate("/banker/login?error=oauth");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="font-mono text-sm text-navy-600">Signing you in…</p>
    </div>
  );
}
