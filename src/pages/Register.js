import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../components/css/auth.css"; // Import CSS
import Popup from "../components/common/Popup"; // Import Popup component
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isSuccessPopupOpen, setSuccessPopupOpen] = useState(false); // State for success popup
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/register", formData);
      setSuccessPopupOpen(true); // Show success popup
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <div className="auth-container">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <LanguageSwitcher compact />
        </div>
        <img src="/salad.png" alt="App Logo" className="auth-logo" />
        <h2 className="auth-title">{t("auth.register")}</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder={t("auth.username")}
            onChange={handleChange}
            required
          />
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
          <button type="submit">{t("auth.register")}</button>
        </form>
        <p className="auth-link" onClick={() => navigate("/login")}>
          {t("auth.hasAccount")}
        </p>

        {/* Success Popup */}
        <Popup
          isOpen={isSuccessPopupOpen}
          onClose={() => setSuccessPopupOpen(false)}
        >
          <div className="success-popup">
            <div className="checkmark">✔</div>
            <h2>Registration Successful!</h2>
            <button className="login-button" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </Popup>
      </div>
    </div>
  );
};

export default Register;
