import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import "../css/global.css";

const DailyList = ({ dailyData, onClickEdit, selectedDate }) => {
  return (
    <ul className="food-list daily-list">
      {dailyData.entries.length > 0 ? (
        dailyData.entries.map((entry) => (
          <li
            key={`${entry.entry_type}:${entry.entry_type === "food" ? entry.food_id : entry.recipe_id}`}
            className="food-item"
          >
            <div className="food-name">
              {entry.amount}x <strong>{entry.name}</strong>
            </div>
            <div className="food-nutrients">
              Proteins: {parseFloat(entry.total_proteins).toFixed(2)} g | Fats:{" "}
              {parseFloat(entry.total_fats).toFixed(2)} g | Sugars:{" "}
              {parseFloat(entry.total_sugars).toFixed(2)} g
            </div>
            <div className="food-kcal">
              {parseFloat(entry.total_kcal.toFixed(1))} kcal
            </div>
            <div className="food-actions">
              <button
                onClick={() =>
                  onClickEdit({
                    entry_type: entry.entry_type,
                    food_id: entry.food_id,
                    recipe_id: entry.recipe_id,
                    name: entry.name,
                  })
                }
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
            </div>
          </li>
        ))
      ) : (
        <p>No food logged for {selectedDate.toISOString().split("T")[0]}</p>
      )}
    </ul>
  );
};

export default DailyList;
