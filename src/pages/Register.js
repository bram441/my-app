import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "../components/css/auth.css"; // Import CSS
import Popup from "../components/common/Popup"; // Import Popup component

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isSuccessPopupOpen, setSuccessPopupOpen] = useState(false); // State for success popup
  const navigate = useNavigate();

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
        <img src="/salad.png" alt="App Logo" className="auth-logo" />
        <h2 className="auth-title">Register</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <button type="submit">Register</button>
        </form>
        <p className="auth-link" onClick={() => navigate("/login")}>
          Already have an account? Login here
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
