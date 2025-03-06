import { useState, useEffect, useContext, use } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import for charts
import moment from "moment"; // Import moment.js for formatting timestamps
import "./css/daily.css"; // ✅ Import the new CSS file
import Popup from "./Popup.js";

const Daily = () => {
  const { user } = useContext(AuthContext);
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

  const fetchDailyConsumption = async () => {
    try {
      const response = await API.get(`/daily-entries`);
      setDailyData(response.data);

      let cumulativeKcal = 0;
      const progress = response.data.entriesSeperate.map((entry) => {
        cumulativeKcal += entry.total_kcal;

        // Convert time to decimal format (e.g., 09:32 → 9.53)
        const timeMoment = moment(entry.createdAt);
        const hour = timeMoment.hours();
        const minutes = timeMoment.minutes();
        const decimalTime = hour + minutes / 60;
        setCalorieProgress(progress);
        return {
          time: decimalTime, // Store as a number for correct placement
          kcal: cumulativeKcal,
          label: `${entry.Food.name} x${entry.amount}`,
          displayTime: timeMoment.format("HH:mm"),
        };
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyConsumption();
  }, []);

  const onClickDelete = async (entryId) => {
    try {
      await API.delete(`/daily-entries/${entryId}`);
      await fetchDailyConsumption();
      setPopupOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete entry");
    }
  };

  const onClickEdit = (foodId, foodName) => {
    setSelectedEntry(foodId);
    setSelectedEntryName(foodName);
    setPopupOpen(true);
  };

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
        <h3>Today's Consumption</h3>
        <h4>
          Total Calories: {parseFloat(dailyData.totalCalories).toFixed(2)} kcal
        </h4>
        {loading && <p>Loading...</p>}

        <div className="food-list">
          {dailyData.entries.length > 0 ? (
            dailyData.entries.map((entry) => (
              <li key={entry.id} className="food-item">
                {entry.amount}x <strong>{entry.name}</strong> (
                {parseFloat(entry.total_kcal.toFixed(1))} kcal)
                <button onClick={() => onClickEdit(entry.food_id, entry.name)}>
                  Edit
                </button>
              </li>
            ))
          ) : (
            <p>No food logged for today</p>
          )}
        </div>
      </div>
      <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
        <h2>Remove daily entries for {selectedEntryName}</h2>
        <div className="food-list">
          {dailyData.entriesSeperate.filter(
            (entry) => entry.food_id === selectedEntry
          ).length > 0 ? (
            dailyData.entriesSeperate
              .filter((entry) => entry.food_id === selectedEntry)
              .map((entry) => (
                <li key={entry.id} className="food-item">
                  {entry.amount}x <strong>{entry.name}</strong> (
                  {parseFloat(entry.total_kcal.toFixed(1))} kcal)
                  <button onClick={() => onClickDelete(entry.id)}>
                    Delete
                  </button>
                </li>
              ))
          ) : (
            <p>Geen eten meer</p>
          )}
        </div>
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
