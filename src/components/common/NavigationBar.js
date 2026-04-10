import React, { useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import useAuth from "../../api/useAuth";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const NavigationBar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { role } = useAuth();
  const { t } = useLanguage();

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: t("nav.dashboard"), action: () => navigate("/dashboard") },
    { label: t("nav.addFood"), action: () => navigate("/toevoegen") },
    { label: t("nav.recipes"), action: () => navigate("/recipes") },
    ...(role === "admin"
      ? [{ label: t("nav.dbManagement"), action: () => navigate("/DBChanges") }]
      : []),
    { label: t("nav.profile"), action: () => navigate("/profile") },
    {
      label: t("nav.logout"),
      action: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            "linear-gradient(90deg, rgba(79,70,229,0.95) 0%, rgba(14,165,233,0.95) 100%)",
          borderRadius: 0,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleMenu}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>
            Kcal Teller
          </Typography>
          <Box sx={{ ml: 3, display: { xs: "none", md: "flex" }, gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={item.action}
                sx={{ fontWeight: 600 }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          <Box sx={{ ml: "auto", display: { xs: "none", md: "block" } }}>
            <LanguageSwitcher compact />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={isMenuOpen} onClose={toggleMenu}>
        <Box sx={{ width: 260 }} role="presentation">
          <List>
            <Box sx={{ px: 2, py: 1 }}>
              <LanguageSwitcher compact />
            </Box>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.label}
                onClick={() => {
                  item.action();
                  setMenuOpen(false);
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NavigationBar;
