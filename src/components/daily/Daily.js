import { useState, useEffect, useCallback } from "react";
import API from "../../api/api.js";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import for charts
import moment from "moment"; // Import moment.js for formatting timestamps
import Popup from "../common/Popup.js";
import DailyList from "./DailyList.js";
import PopupList from "./PopupList.js";
import FoodChatInput from "../chatbot/FoodChatInput"; // Import FoodChatInput
import { Box, IconButton, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { useLanguage } from "../../context/LanguageContext";

export const fetchDailyConsumption = async (
  setDailyData,
  setCalorieProgress,
  setLoading,
  setError,
  setTotalCalories,
  selectedDate
) => {
  try {
    const response = await API.get(
      `/daily-entries?date=${selectedDate.toISOString().split("T")[0]}`
    ); // Use selectedDate
    setDailyData(response.data);
    setTotalCalories(response.data.totalCalories || 0);
    let cumulativeKcal = 0;
    const progress = response.data.entriesSeperate.map((entry) => {
      cumulativeKcal += entry.total_kcal;

      // Convert time to decimal format (e.g., 09:32 → 9.53)
      const timeMoment = moment(entry.createdAt);
      const hour = timeMoment.hours();
      const minutes = timeMoment.minutes();
      const decimalTime = hour + minutes / 60;

      // Determine the label based on whether it's a recipe or food
      const label = entry.food_id
        ? `${entry.Food.name} x${entry.amount}` // Food entry
        : `${entry.Recipe.name} x${entry.amount}`; // Recipe entry

      return {
        time: decimalTime, // Store as a number for correct placement
        kcal: cumulativeKcal,
        label: label,
        displayTime: timeMoment.format("HH:mm"),
      };
    });

    setCalorieProgress(progress);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to load data");
  } finally {
    setLoading(false);
  }
};

const Daily = ({ setTotalCalories, selectedDate }) => {
  const { t } = useLanguage();
  const [dailyData, setDailyData] = useState({
    totalCalories: 0,
    entries: [],
    entriesSeperate: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calorieProgress, setCalorieProgress] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedEntryName, setSelectedEntryName] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchDailyConsumption(
      setDailyData,
      setCalorieProgress,
      setLoading,
      setError,
      setTotalCalories,
      selectedDate
    );
  }, [setTotalCalories, selectedDate]);

  const onClickDelete = useCallback(
    async (entryId) => {
      try {
        await API.delete(`/daily-entries/${entryId}`);
        await fetchDailyConsumption(
          setDailyData,
          setCalorieProgress,
          setLoading,
          setError,
          setTotalCalories,
          selectedDate
        );
        setPopupOpen(false);
      } catch (err) {
        setError(err.response?.data?.message || t("daily.deleteFailed"));
      }
    },
    [setTotalCalories, selectedDate, t]
  );

  const onClickUpdateAmount = useCallback(
    async (entryId, amount) => {
      try {
        await API.put(`/daily-entries/${entryId}`, { amount });
        await fetchDailyConsumption(
          setDailyData,
          setCalorieProgress,
          setLoading,
          setError,
          setTotalCalories,
          selectedDate
        );
      } catch (err) {
        setError(err.response?.data?.message || t("daily.updateFailed"));
      }
    },
    [setTotalCalories, selectedDate, t]
  );

  const onClickEdit = useCallback((group) => {
    setSelectedEntry(group);
    setSelectedEntryName(group?.name || "");
    setPopupOpen(true);
  }, []);

  // Generate 2-hour interval labels
  const timeLabels = [];
  for (let i = 0; i <= 24; i += 2) {
    timeLabels.push(i);
  }

  // Graph Data
  const chartData = {
    labels: timeLabels, // X-Axis in 2-hour intervals
    datasets: [
      {
        label: t("daily.cumulativeKcal"),
        data: calorieProgress.map((data) => ({
          x: data.time,
          y: data.kcal,
        })),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#ff6384",
      },
    ],
  };

  // Graph Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 24,
        ticks: {
          stepSize: 2,
          callback: function (value) {
            return `${value}:00`;
          },
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t("daily.caloriesAxis"),
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: () => null,
          label: function (tooltipItem) {
            const entry = calorieProgress[tooltipItem.dataIndex];
            return `${entry.label} - ${
              entry.displayTime
            } - ${tooltipItem.raw.y.toFixed(1)} kcal`;
          },
        },
      },
    },
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
      <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6">
          {t("daily.consumptionFor")} {selectedDate.toISOString().split("T")[0]}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 0.5 }}>
          {t("daily.totalCalories")}: {parseFloat(dailyData.totalCalories).toFixed(2)} kcal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("daily.proteins")}: {parseFloat(dailyData.totalProteins).toFixed(2)} g | {t("daily.fats")}:{" "}
          {parseFloat(dailyData.totalFats).toFixed(2)} g | {t("daily.sugars")}:{" "}
          {parseFloat(dailyData.totalSugars).toFixed(2)} g
        </Typography>
        {loading && <Typography>{t("daily.loading")}</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <IconButton
          color="primary"
          onClick={() => setIsChatOpen(true)}
          aria-label={t("daily.openFoodChat")}
          sx={{
            mt: 0.5,
            alignSelf: "flex-start",
            width: 36,
            height: 36,
            border: "1px solid rgba(79, 70, 229, 0.35)",
            borderRadius: 1.5,
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "rgba(79,70,229,0.08)",
            },
          }}
        >
          <ChatIcon />
        </IconButton>
        <Popup
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          size="large"
        >
          <FoodChatInput
            onClose={() => setIsChatOpen(false)}
            refreshDailyEntries={() =>
              fetchDailyConsumption(
                setDailyData,
                setCalorieProgress,
                setLoading,
                setError,
                setTotalCalories,
                selectedDate
              )
            }
          />
        </Popup>

        <DailyList
          dailyData={dailyData}
          onClickEdit={onClickEdit}
          selectedDate={selectedDate}
        />
      </Box>
      <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
        <Typography variant="h6">{t("daily.manageEntriesFor")} {selectedEntryName}</Typography>
        <PopupList
          dailyData={dailyData}
          selectedEntry={selectedEntry}
          onClickDelete={onClickDelete}
          onClickUpdateAmount={onClickUpdateAmount}
        />
      </Popup>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {t("daily.kcalProgressDay")}
        </Typography>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(79, 70, 229, 0.04)",
            height: { xs: 260, sm: 320, lg: 420 },
            overflow: "hidden",
          }}
        >
          <Line data={chartData} options={chartOptions} />
        </Box>
      </Box>
    </Box>
  );
};

export default Daily;
