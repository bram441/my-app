import { useState, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../components/css/auth.css"; // Import CSS
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/users/login", formData);
      login(response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <LanguageSwitcher compact />
        </div>
        <img src="/salad.png" alt="App Logo" className="auth-logo" />
        <h2 className="auth-title">{t("auth.welcomeBack")}</h2>
        <p className="auth-subtitle">{t("auth.loginSubtitle")}</p>
        {error && <p className="error-message">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder={t("auth.email")}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder={t("auth.password")}
            onChange={handleChange}
            required
          />
          <button type="submit">{t("auth.login")}</button>
        </form>
        <p className="auth-link" onClick={() => navigate("/register")}>
          {t("auth.noAccount")}
        </p>
        <p className="auth-link" onClick={() => navigate("/forgot-password")}>
          {t("auth.forgotPassword")}
        </p>
      </div>
    </div>
  );
};

export default Login;
