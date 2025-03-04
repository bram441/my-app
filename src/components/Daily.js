import { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import for charts
import moment from "moment"; // Import moment.js for formatting timestamps

const Daily = () => {
  const { user } = useContext(AuthContext);
  const [dailyData, setDailyData] = useState({ totalCalories: 0, entries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calorieProgress, setCalorieProgress] = useState([]);

  useEffect(() => {
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
          const decimalTime = hour + minutes / 60; // Convert to decimal hours

          return {
            time: decimalTime, // Store as a number for correct placement
            kcal: cumulativeKcal,
            label: `${entry.Food.name} x${entry.amount}`, // Tooltip label
            displayTime: timeMoment.format("HH:mm"), // Store for tooltip
          };
        });

        setCalorieProgress(progress);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchDailyConsumption();
  }, []);

  // Generate 2-hour interval labels
  const timeLabels = [];
  for (let i = 0; i <= 24; i += 2) {
    timeLabels.push(i); // Use numbers instead of strings
  }

  // Graph Data
  const chartData = {
    labels: timeLabels, // X-Axis in 2-hour intervals
    datasets: [
      {
        label: "Cumulative Kcal",
        data: calorieProgress.map((data) => ({
          x: data.time, // Correct placement using decimal time
          y: data.kcal,
        })),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        tension: 0.4,
        pointRadius: 5, // Larger points for visibility
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
        type: "linear", // Change to linear for proper placement
        min: 0,
        max: 24,
        ticks: {
          stepSize: 2,
          callback: function (value) {
            return `${value}:00`; // Display as full hours
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
            return `${entry.label} - ${entry.displayTime} - ${tooltipItem.raw.y} kcal`;
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Today's Consumption</h2>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      <h3>Total Calories: {dailyData.totalCalories} kcal</h3>

      <ul>
        {dailyData.entries.length > 0 ? (
          dailyData.entries.map((entry) => (
            <li key={entry.id}>
              {entry.amount}x <strong>{entry.name} </strong>(
              {parseFloat(entry.total_kcal.toFixed(1))} kcal)
            </li>
          ))
        ) : (
          <p>No food logged for today</p>
        )}
      </ul>

      {/* Calorie Progress Graph */}
      <div className="chart-container">
        <h4>Kcal Progress Over the Day</h4>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Daily;
