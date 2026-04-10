import { useState } from "react";
import SearchEngine from "../components/daily-entry/SearchEngine";
import AddForm from "../components/daily-entry/AddForm";
import NavigationBar from "../components/common/NavigationBar";
import { Box } from "@mui/material";
import PageShell from "../components/ui/PageShell";
import SectionCard from "../components/ui/SectionCard";

const ToevoegenEten = () => {
  const [selectedFood, setSelectedFood] = useState(null);

  return (
    <>
      <header>
        <NavigationBar />
      </header>
      <PageShell>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
            <SectionCard title="Zoek Voedsel" sx={{ width: "100%" }}>
              <SearchEngine onSelectFood={setSelectedFood} />
            </SectionCard>
            <SectionCard title="Voedsel Toevoegen" sx={{ width: "100%" }}>
              <AddForm
                selectedFood={selectedFood}
                setSelectedFood={setSelectedFood}
              />
            </SectionCard>
        </Box>
      </PageShell>
    </>
  );
};

export default ToevoegenEten;
