import React from "react";

const PopupList = ({ dailyData, selectedEntry, onClickDelete }) => {
  return (
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
              <button onClick={() => onClickDelete(entry.id)}>Delete</button>
            </li>
          ))
      ) : (
        <p>Geen eten meer</p>
      )}
    </div>
  );
};

export default PopupList;
