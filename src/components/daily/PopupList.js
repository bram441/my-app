import React from "react";
import { useState } from "react";
import "../css/global.css";

const PopupList = ({
  dailyData,
  selectedEntry,
  onClickDelete,
  onClickUpdateAmount,
}) => {
  const [amountById, setAmountById] = useState({});

  const getEntryName = (entry) =>
    entry.entry_type === "food"
      ? entry.Food?.name || "Unknown Food"
      : entry.Recipe?.name || "Unknown Recipe";

  const matchesGroup = (entry) => {
    if (!selectedEntry) return false;
    if (selectedEntry.entry_type !== entry.entry_type) return false;
    if (entry.entry_type === "food") return entry.food_id === selectedEntry.food_id;
    if (entry.entry_type === "recipe")
      return entry.recipe_id === selectedEntry.recipe_id;
    return false;
  };

  const entries = dailyData.entriesSeperate.filter(matchesGroup);

  return (
    <ul className="food-list popup-list">
      {entries.length > 0 ? (
        entries.map((entry) => (
            <li key={entry.id} className="food-item">
              <div className="food-name">
                {entry.amount}x <strong>{getEntryName(entry)}</strong>
              </div>
              <div className="food-kcal">
                {parseFloat(entry.total_kcal.toFixed(1))} kcal
              </div>
              <div className="food-actions" style={{ gap: 8, display: "flex" }}>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    amountById[entry.id] !== undefined
                      ? amountById[entry.id]
                      : entry.amount
                  }
                  onChange={(e) =>
                    setAmountById((prev) => ({
                      ...prev,
                      [entry.id]: e.target.value,
                    }))
                  }
                  style={{ width: 110 }}
                  aria-label="Update amount"
                />
                <button
                  onClick={() =>
                    onClickUpdateAmount(entry.id, amountById[entry.id] ?? entry.amount)
                  }
                >
                  Save
                </button>
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
