import { useState } from "react";
import { authApi, registerPushNotifications } from "../services/api";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("osmar@olam.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem("ofi_token", data.token);
      localStorage.setItem("ofi_user", JSON.stringify(data.user));
      await registerPushNotifications();
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1E1040 0%, #2D1A5E 50%, #1E1040 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 40, width: "100%", maxWidth: 400,
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, margin: "0 auto 12px",
            background: "linear-gradient(135deg,#7C3AED,#EA580C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 900, color: "#fff",
          }}>ofi</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111827" }}>OFI Viáticos</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>Olam Food Ingredients</p>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, marginBottom: 20, fontSize: 13, color: "#991B1B" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#4B5563", marginBottom: 5 }}>
              Correo electrónico
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#4B5563", marginBottom: 5 }}>
              Contraseña
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "12px", background: loading ? "#9CA3AF" : "linear-gradient(135deg,#7C3AED,#5B21B6)",
              border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", transition: "all .15s",
            }}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: "12px", background: "#F9FAFB", borderRadius: 8, fontSize: 12, color: "#6B7280", textAlign: "center" }}>
          <strong>Demo:</strong> osmar@olam.com / password
        </div>
      </div>
    </div>
  );
}
