import React from "react";
import AppDialog from "../ui/AppDialog";

const Popup = ({ isOpen, onClose, children, size = "small" }) => {
  return (
    <AppDialog isOpen={isOpen} onClose={onClose} size={size}>
      {children}
    </AppDialog>
  );
};

export default Popup;
