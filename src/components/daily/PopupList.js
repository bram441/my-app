import React from "react";
import "../css/global.css";

const PopupList = ({ dailyData, selectedEntry, onClickDelete }) => {
  return (
    <ul className="food-list popup-list">
      {dailyData.entriesSeperate.filter(
        (entry) => entry.food_id === selectedEntry
      ).length > 0 ? (
        dailyData.entriesSeperate
          .filter((entry) => entry.food_id === selectedEntry)
          .map((entry) => (
            <li key={entry.id} className="food-item">
              <div className="food-name">
                {entry.amount}x <strong>{entry.name}</strong>
              </div>
              <div className="food-kcal">
                {parseFloat(entry.total_kcal.toFixed(1))} kcal
              </div>
              <div className="food-actions">
                <button onClick={() => onClickDelete(entry.id)}>Delete</button>
              </div>
            </li>
          ))
      ) : (
        <p>Geen eten meer</p>
      )}
    </ul>
  );
};

export default PopupList;
