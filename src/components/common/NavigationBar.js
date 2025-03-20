import React, { useState } from "react";
import { useContext } from "react";
import "./css/NavigationBar.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import useAuth from "../api/useAuth";

const NavigationBar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { role } = useAuth();

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="hamburger" onClick={toggleMenu}>
        &#9776; {/* Hamburger icon */}
      </div>
      <ul className={isMenuOpen ? "active" : ""}>
        <li>
          <button
            onClick={() => {
              navigate("/dashboard");
              setMenuOpen(false); // Close menu on navigation
            }}
          >
            Dashboard
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              navigate("/toevoegen");
              setMenuOpen(false); // Close menu on navigation
            }}
          >
            Eten Toevoegen
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              navigate("/recipes");
              setMenuOpen(false); // Close menu on navigation
            }}
          >
            Recipes
          </button>
        </li>
        {role === "admin" && (
          <li>
            <button
              onClick={() => {
                navigate("/DBChanges");
                setMenuOpen(false); // Close menu on navigation
              }}
            >
              Toevoegen eten aan DB
            </button>
          </li>
        )}
        <li>
          <button
            onClick={() => {
              logout();
              navigate("/login");
              setMenuOpen(false); // Close menu on navigation
            }}
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
