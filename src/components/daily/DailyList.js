import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import "../css/global.css";

const DailyList = ({ dailyData, onClickEdit }) => {
  return (
    <ul className="food-list">
      {dailyData.entries.length > 0 ? (
        dailyData.entries.map((entry) => (
          <li key={entry.id} className="food-item">
            <div className="food-name">
              {entry.amount}x <strong>{entry.name}</strong>
            </div>
            <div className="food-kcal">
              {parseFloat(entry.total_kcal.toFixed(1))} kcal
            </div>
            <div className="food-actions">
              <button onClick={() => onClickEdit(entry.food_id, entry.name)}>
                <FontAwesomeIcon icon={faEdit} />
              </button>
            </div>
          </li>
        ))
      ) : (
        <p>No food logged for today</p>
      )}
    </ul>
  );
};

export default DailyList;
