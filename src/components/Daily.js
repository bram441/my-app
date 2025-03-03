import { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

const Daily = () => {
  const { user } = useContext(AuthContext);
  const [dailyData, setDailyData] = useState({ totalCalories: 0, entries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDailyConsumption = async () => {
      try {
        const response = await API.get(`/daily-entries`);
        setDailyData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchDailyConsumption();
  }, []);

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
              Naam: {entry.name}, Hoeveel: {entry.amount}, Kcal:
              {entry.total_kcal}
            </li>
          ))
        ) : (
          <p>No food logged for today</p>
        )}
      </ul>
    </div>
  );
};

export default Daily;
