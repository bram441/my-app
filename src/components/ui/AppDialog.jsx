import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent, IconButton } from "@mui/material";

const sizeToWidth = {
  small: "sm",
  medium: "md",
  large: "lg",
};

const AppDialog = ({ isOpen, onClose, children, size = "small" }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth={sizeToWidth[size] || "sm"}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          zIndex: 1,
          color: "text.secondary",
          "&:hover": {
            color: "text.primary",
            bgcolor: "rgba(15,23,42,0.08)",
          },
        }}
        aria-label="Close"
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ pt: 5 }}>{children}</DialogContent>
    </Dialog>
  );
};

export default AppDialog;
