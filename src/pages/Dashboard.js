import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import NavigationBar from "../components/common/NavigationBar";
import Daily from "../components/daily/Daily";
import WeeklyStats from "../components/charts/WeeklyStats";
import ProgressBar from "../components/common/ProgressBar"; // ✅ Import ProgressBar
import "../components/css/dashboard.css";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker CSS
import FoodChatInput from "../components/chatbot/FoodChatInput"; // Import FoodChatInput
import Popup from "../components/common/Popup";

const Dashboard = () => {
  const { user, selectedDate, setSelectedDate } = useContext(AuthContext);
  const [totalCalories, setTotalCalories] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getGreeting = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 6 && currentHour < 11) {
      return "Goeiemorgen";
    } else if (currentHour >= 11 && currentHour < 13) {
      return "Goeie middag";
    } else if (currentHour >= 13 && currentHour < 18) {
      return "Goeie namiddag";
    } else if (currentHour >= 18 && currentHour < 23) {
      return "Goeie avond";
    } else {
      return "Goeie nacht";
    }
  };

  return (
    <div>
      <header>
        <NavigationBar />
      </header>

      {/* Add Date Picker */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px",
        }}
      >
        <label style={{ fontWeight: "bold", fontSize: "16px" }}>
          Select Date:
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          className="custom-date-picker" // Add a custom class for styling
        />
      </div>

      {/* ✅ Progress Bar at the Top */}
      <ProgressBar totalCalories={totalCalories} goal={user?.kcal_goal} />
      <h1>
        {getGreeting()}, {user?.username}!
      </h1>
      <button
        className="chat-launch-button"
        onClick={() => setIsChatOpen(true)}
      >
        Gebruik voedingschat
      </button>
      <Popup
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        size="large"
      >
        <FoodChatInput onClose={() => setIsChatOpen(false)} />
      </Popup>

      <div className="dashboard-container">
        {/* ✅ Daily at the top */}
        <div className="full-width-panel">
          <Daily
            setTotalCalories={setTotalCalories}
            selectedDate={selectedDate}
          />
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
