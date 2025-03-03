import React from "react";
import { useContext } from "react";
import "./css/NavigationBar.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NavigationBar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <ul>
        <li>
          <button
            onClick={() => {
              navigate("/toevoegen");
            }}
          >
            Eten Toevoegen
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              logout();
              navigate("/login");
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
