import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n";

const AdminLogin = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      console.log("Login response:", res);
      if (res.role === "ADMIN") {
        navigate("/admin");
      } else {
        setError(t('admin.notAdmin') || "Not an admin account.");
      }
    } catch (err) {
      setError(t('common.invalidCreds') || "Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "3rem auto", padding: 24, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001" }}>
      <h2>{t('admin.loginTitle') || "Admin Login"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>{t('auth.email') || "Email"}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>{t('auth.password') || "Password"}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: 8 }} />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? (t('auth.loggingIn') || "Logging in...") : (t('admin.loginBtn') || "Login as Admin")}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
