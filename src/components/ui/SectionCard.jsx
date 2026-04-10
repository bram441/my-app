import { Card, CardContent, Typography } from "@mui/material";

const SectionCard = ({ title, children, sx = {}, contentSx = {} }) => {
  return (
    <Card sx={{ ...sx }}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, ...contentSx }}>
        {title ? (
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {title}
          </Typography>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
};

export default SectionCard;
