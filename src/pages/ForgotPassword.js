import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import API from "../api/api";
import "../components/css/auth.css";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate(); // Initialize navigate
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/forgot-password", { email });
      setMessage(t("authExtra.resetSent"));
      setSuccess(true); // Set success to true
    } catch (err) {
      setError(err.response?.data?.message || t("authExtra.forgotFailed"));
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <LanguageSwitcher compact />
        </div>
        <h2 className="auth-title">{t("authExtra.forgotTitle")}</h2>
        {success ? (
          // Show only the success message if the email was sent successfully
          <p className="success-message">{message}</p>
        ) : (
          <>
            <p className="auth-subtitle">
              {t("authExtra.forgotSubtitle")}
            </p>
            {error && <p className="error-message">{error}</p>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
              <button type="submit" className="button">
                {t("authExtra.sendResetLink")}
              </button>
            </form>
            <button
              className="button button-secondary"
              onClick={() => navigate(-1)} // Navigate back to the previous page
            >
              {t("authExtra.goBack")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
