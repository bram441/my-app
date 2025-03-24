import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import API from "../api/api";
import "../components/css/auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/users/forgot-password", { email });
      setMessage("Password reset link sent. Check your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h2 className="auth-title">Forgot Your Password?</h2>
        <p className="auth-subtitle">
          Enter your email address to receive a password reset link.
        </p>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="button">
            Send Reset Link
          </button>
        </form>
        <button
          className="button button-secondary" // Use a secondary button style
          onClick={() => navigate(-1)} // Navigate back to the previous page
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
