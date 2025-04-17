import React from "react";
import "../css/popup.css"; // ✅ Import CSS for styling
import "../css/global.css";

const Popup = ({ isOpen, onClose, children, size = "small" }) => {
  if (!isOpen) return null; // Don't render if not open

  return (
    <div className="popup-overlay">
      <div className={`popup-content ${size === "large" ? "popup-large" : ""}`}>
        <button className="popup-close" onClick={onClose}>
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
