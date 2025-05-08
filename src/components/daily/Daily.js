import { useState, useEffect, useCallback } from "react";
import API from "../../api/api.js";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import for charts
import moment from "moment"; // Import moment.js for formatting timestamps
import "../css/daily.css";
import Popup from "../common/Popup.js";
import DailyList from "./DailyList.js";
import PopupList from "./PopupList.js";
import FoodChatInput from "../chatbot/FoodChatInput"; // Import FoodChatInput

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
        setError(err.response?.data?.message || "Failed to delete entry");
      }
    },
    [setTotalCalories, selectedDate]
  );

  const onClickEdit = useCallback((foodId, foodName) => {
    setSelectedEntry(foodId);
    setSelectedEntryName(foodName);
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
        label: "Cumulative Kcal",
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
          text: "Calories",
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
    <div className="daily-container">
      <div className="left-section">
        <h3>Consumption for {selectedDate.toISOString().split("T")[0]}</h3>
        <h4>
          Total Calories: {parseFloat(dailyData.totalCalories).toFixed(2)} kcal
        </h4>
        {/* Add smaller totals for proteins, fats, and sugars */}
        <p className="totals-small">
          Proteins: {parseFloat(dailyData.totalProteins).toFixed(2)} g | Fats:{" "}
          {parseFloat(dailyData.totalFats).toFixed(2)} g | Sugars:{" "}
          {parseFloat(dailyData.totalSugars).toFixed(2)} g
        </p>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        <button
          className="chat-launch-button"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open voedingschat"
        >
          <i className="fas fa-comment-dots"></i> {/* Font Awesome chat icon */}
        </button>
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
      </div>
      <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
        <h2>Remove daily entries for {selectedEntryName}</h2>
        <PopupList
          dailyData={dailyData}
          selectedEntry={selectedEntry}
          onClickDelete={onClickDelete}
        />
      </Popup>

      <div className="right-section">
        <h3>Kcal Progress Over the Day</h3>
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Daily;
