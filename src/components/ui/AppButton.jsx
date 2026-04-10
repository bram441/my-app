import { Button } from "@mui/material";

const getVariantProps = (variant) => {
  if (variant === "danger") {
    return {
      color: "error",
      variant: "contained",
      sx: {
        bgcolor: "#dc2626",
        "&:hover": {
          bgcolor: "#b91c1c",
        },
      },
    };
  }
  if (variant === "secondary") {
    return { color: "secondary", variant: "contained" };
  }
  if (variant === "ghost") {
    return { color: "primary", variant: "text" };
  }
  return { color: "primary", variant: "contained" };
};

const AppButton = ({ variant = "primary", sx, children, ...props }) => {
  const buttonProps = getVariantProps(variant);
  return (
    <Button
      {...buttonProps}
      {...props}
      sx={{ minHeight: 40, ...(buttonProps.sx || {}), ...sx }}
    >
      {children}
    </Button>
  );
};

export default AppButton;
