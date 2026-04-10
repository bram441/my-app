import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import {
  Alert,
  Box,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NavigationBar from "../components/common/NavigationBar";
import PageShell from "../components/ui/PageShell";
import SectionCard from "../components/ui/SectionCard";
import AppButton from "../components/ui/AppButton";
import Popup from "../components/common/Popup";
import { useLanguage } from "../context/LanguageContext";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();
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
    <Box>
      <NavigationBar />
      <PageShell maxWidth="sm">
        <SectionCard title={t("profile.title")}>
          <Stack component="form" spacing={2} onSubmit={handleConfirm}>
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              name="username"
              label={t("profile.username")}
              value={formData.username}
              onChange={handleChange}
              required
            />
            <TextField
              type="email"
              name="email"
              label={t("profile.email")}
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              type="number"
              name="kcal_goal"
              label={t("profile.kcalGoal")}
              value={formData.kcal_goal}
              onChange={handleChange}
              required
            />
            <TextField
              type="password"
              name="password"
              label={t("profile.newPassword")}
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              type="password"
              name="confirmPassword"
              label={t("profile.confirmPassword")}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <AppButton type="submit">{t("profile.update")}</AppButton>
              <AppButton variant="ghost" onClick={() => navigate(-1)}>
                {t("profile.back")}
              </AppButton>
            </Stack>
          </Stack>
        </SectionCard>
      </PageShell>

      <Popup isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
        <Stack spacing={2}>
          <Typography variant="h6">{t("profile.confirmTitle")}</Typography>
          <Typography color="text.secondary">{t("profile.confirmText")}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <AppButton
              onClick={() => {
                setShowConfirmation(false);
                handleSubmit();
              }}
            >
              {t("profile.confirmYes")}
            </AppButton>
            <AppButton variant="ghost" onClick={() => setShowConfirmation(false)}>
              {t("profile.cancel")}
            </AppButton>
          </Stack>
        </Stack>
      </Popup>
    </Box>
  );
};

export default Profile;
