import { useState, useEffect } from "react";
import API from "../api/api";
import { Bar } from "react-chartjs-2";
import "chart.js/auto"; // Import for charts

const WeeklyStats = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyConsumption = async () => {
      try {
        const response = await API.get(`/daily-entries/weekly`);
        setWeeklyData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyConsumption();
  }, []);

  // Graph Data
  const chartData = {
    labels: weeklyData.map((entry) => entry.date),
    datasets: [
      {
        label: "Total Kcal",
        data: weeklyData.map((entry) => entry.totalCalories),
        backgroundColor: "#28a745",
      },
    ],
  };

  return (
    <div>
      <h2>Weekly Overview</h2>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      <div className=".weekly-chart-container">
        <h4>Total Kcal Last 7 Days</h4>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default WeeklyStats;
