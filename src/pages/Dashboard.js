import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Daily from "../components/Daily";
import WeeklyStats from "../components/WeeklyStats";
import "../components/css/dashboard.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <h2>Welcome, {user?.username}!</h2>
      <p>Email: {user?.email}</p>

      <div className="dashboard-container">
        {/* Left Panel: Daily kcal consumption + Graph */}
        <div className="left-panel">
          <Daily />
        </div>

        {/* Right Panel: Weekly kcal stats */}
        <div className="right-panel">
          <WeeklyStats />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
