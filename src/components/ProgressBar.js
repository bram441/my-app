import React from "react";
import "./css/progressBar.css";

const ProgressBar = ({ totalCalories, goal = 1600 }) => {
  const progress = Math.min((totalCalories / goal) * 100, 100); // Cap at 100%

  return (
    <div className="progress-container">
      <div className="progress-labels">
        <span>Total Kcal: {parseFloat(totalCalories).toFixed(2)}</span>
        <span>Goal: {goal} kcal</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
