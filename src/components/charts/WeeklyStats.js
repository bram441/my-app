import { useState, useEffect } from "react";
import API from "../../api/api";
import { Bar } from "react-chartjs-2";
import "chart.js/auto"; // Import for charts
import { useLanguage } from "../../context/LanguageContext";

const WeeklyStats = () => {
  const { t } = useLanguage();
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyConsumption = async () => {
      try {
        const response = await API.get(`/daily-entries/weekly`);
        setWeeklyData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || t("weekly.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyConsumption();
  }, [t]);

  // Graph Data
  const chartData = {
    labels: weeklyData.map((entry) => entry.date),
    datasets: [
      {
        label: t("weekly.totalKcal"),
        data: weeklyData.map((entry) => entry.totalCalories),
        backgroundColor: "#28a745",
      },
    ],
  };

  return (
    <div>
      <h2>{t("weekly.weeklyOverview")}</h2>
      {loading ? <p>{t("weekly.loading")}</p> : null}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}

      <div className=".weekly-chart-container">
        <h4>{t("weekly.totalLast7Days")}</h4>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default WeeklyStats;
