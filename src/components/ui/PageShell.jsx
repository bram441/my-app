import { Box, Container } from "@mui/material";

const PageShell = ({ children }) => {
  return (
    <Box sx={{ minHeight: "100vh", pb: 4 }}>
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        {children}
      </Container>
    </Box>
  );
};

export default PageShell;
