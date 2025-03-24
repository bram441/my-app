import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import "../components/css/auth.css"; // Reuse existing styles

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
    kcal_goal: user?.kcal_goal || "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required.");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Invalid email address.");
      return false;
    }
    if (formData.kcal_goal <= 0) {
      setError("Kcal goal must be greater than 0.");
      return false;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await API.put("/users/profile", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        kcal_goal: formData.kcal_goal,
      });

      // Update the token and user context
      console.log(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);

      setMessage("Profile updated successfully!");
      setTimeout(() => navigate("/dashboard"), 2000); // Redirect to dashboard after 2 seconds
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true); // Show confirmation pop-up
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h2 className="auth-title">Your Profile</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form className="auth-form" onSubmit={handleConfirm}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="kcal_goal"
            placeholder="Kcal Goal"
            value={formData.kcal_goal}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="New Password (optional)"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <button type="submit" className="button">
            Update Profile
          </button>
        </form>
        <button
          className="button button-secondary"
          onClick={() => navigate(-1)} // Navigate back to the previous page
        >
          Go Back
        </button>
      </div>

      {/* Confirmation Pop-Up */}
      {showConfirmation && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirm Changes</h3>
            <p>Are you sure you want to update your profile?</p>
            <button
              className="confirm"
              onClick={() => {
                setShowConfirmation(false);
                handleSubmit();
              }}
            >
              Yes, Update
            </button>
            <button
              className="button button-secondary"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
