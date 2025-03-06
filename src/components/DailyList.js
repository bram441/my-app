import React from "react";

const DailyList = ({ dailyData, onClickEdit }) => {
  return (
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
  );
};

export default DailyList;
