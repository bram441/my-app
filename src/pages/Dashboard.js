import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import NavigationBar from "../components/common/NavigationBar";
import Daily from "../components/daily/Daily";
import WeeklyStats from "../components/charts/WeeklyStats";
import ProgressBar from "../components/common/ProgressBar"; // ✅ Import ProgressBar
import API from "../api/api";
import "../components/css/dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [totalCalories, setTotalCalories] = useState(0);

  // Fetch total kcal in Dashboard (instead of Daily)
  useEffect(() => {
    const fetchDailyConsumption = async () => {
      try {
        const response = await API.get(`/daily-entries`);
        setTotalCalories(response.data.totalCalories || 0);
      } catch (err) {
        console.error("Failed to fetch daily kcal:", err);
      }
    };

    fetchDailyConsumption();
  }, []);

  return (
    <div>
      <header>
        <NavigationBar />
      </header>

      {/* ✅ Progress Bar at the Top */}
      <ProgressBar totalCalories={totalCalories} goal={user?.kcal_goal} />

      <h1>Welcome, {user?.username}!</h1>

      <div className="dashboard-container">
        {/* ✅ Daily at the top */}
        <div className="full-width-panel">
          <Daily setTotalCalories={setTotalCalories} />
        </div>

        {/* ✅ Weekly Stats below Daily */}
        <div className="full-width-panel">
          <WeeklyStats />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
