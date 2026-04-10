import { useState } from "react";
import NavigationBar from "../components/common/NavigationBar";
import AddFood from "../components/admin_db/AddFood";
import FoodManagement from "../components/admin_db/FoodManagement";
import { Box, TextField } from "@mui/material";
import PageShell from "../components/ui/PageShell";
import SectionCard from "../components/ui/SectionCard";

const DatabaseManagment = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <header>
        <NavigationBar />
      </header>
      <PageShell>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(380px, 35%) minmax(0, 65%)",
            },
            gap: 2,
            alignItems: "stretch",
          }}
        >
            <SectionCard
              title="Add New Food"
              sx={{ width: "100%", height: { lg: "calc(100vh - 150px)" } }}
              contentSx={{ height: "100%", overflow: "auto" }}
            >
          <AddFood />
            </SectionCard>
            <SectionCard
              title="Manage Foods"
              sx={{ width: "100%", height: { lg: "calc(100vh - 150px)" } }}
              contentSx={{ height: "100%", overflow: "hidden" }}
            >
              <TextField
                fullWidth
                size="small"
                label="Search food"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 1.5 }}
              />
          <FoodManagement searchTerm={searchTerm} />
            </SectionCard>
        </Box>
      </PageShell>
    </>
  );
};

export default DatabaseManagment;
