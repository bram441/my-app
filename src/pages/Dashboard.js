import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import NavigationBar from "../components/common/NavigationBar";
import Daily from "../components/daily/Daily";
import WeeklyStats from "../components/charts/WeeklyStats";
import ProgressBar from "../components/common/ProgressBar"; // ✅ Import ProgressBar
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker CSS
import { Box, Stack, Typography } from "@mui/material";
import SectionCard from "../components/ui/SectionCard";
import PageShell from "../components/ui/PageShell";
import { useLanguage } from "../context/LanguageContext";

const Dashboard = () => {
  const { user, selectedDate, setSelectedDate } = useContext(AuthContext);
  const { t } = useLanguage();
  const [totalCalories, setTotalCalories] = useState(0);

  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 11) {
      return t("dashboard.goodMorning");
    } else if (currentHour >= 11 && currentHour < 13) {
      return t("dashboard.goodNoon");
    } else if (currentHour >= 13 && currentHour < 18) {
      return t("dashboard.goodAfternoon");
    } else if (currentHour >= 18 && currentHour < 23) {
      return t("dashboard.goodEvening");
    } else {
      return t("dashboard.goodNight");
    }
  };

  return (
    <Box>
      <header>
        <NavigationBar />
      </header>
      <PageShell>
        <SectionCard sx={{ mb: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {t("dashboard.selectDate")}:
            </Typography>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="app-date-input"
            />
          </Stack>
        </SectionCard>
        <SectionCard sx={{ mb: 2 }} contentSx={{ pb: 1.5 }}>
          <ProgressBar totalCalories={totalCalories} goal={user?.kcal_goal} />
          <Typography variant="h4" sx={{ mt: 2 }}>
            {getGreeting()}, {user?.username}!
          </Typography>
        </SectionCard>
        <Stack spacing={2}>
          <SectionCard>
            <Daily
              setTotalCalories={setTotalCalories}
              selectedDate={selectedDate}
            />
          </SectionCard>
          <SectionCard>
            <WeeklyStats />
          </SectionCard>
        </Stack>
      </PageShell>
    </Box>
  );
};

export default Dashboard;
