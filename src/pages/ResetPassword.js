import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../components/css/auth.css";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("authExtra.passwordsMismatch"));
      return;
    }

    try {
      await API.post(`/users/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setMessage(t("authExtra.resetSuccess"));
      setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
    } catch (err) {
      setError(err.response?.data?.message || t("authExtra.resetFailed"));
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <LanguageSwitcher compact />
        </div>
        <h2 className="auth-title">{t("authExtra.resetTitle")}</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder={t("authExtra.newPassword")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder={t("authExtra.confirmNewPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="button">
            {t("authExtra.resetPassword")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
