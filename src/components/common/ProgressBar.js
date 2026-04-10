import React from "react";
import "../css/progressBar.css";
import { useLanguage } from "../../context/LanguageContext";

const ProgressBar = ({ totalCalories, goal }) => {
  const { t } = useLanguage();
  const progress = Math.min((totalCalories / goal) * 100, 100); // Cap at 100%

  return (
    <div className="progress-container">
      <div className="progress-labels">
        <span>{t("progress.totalKcal")}: {parseFloat(totalCalories).toFixed(2)}</span>
        <span>{t("progress.goal")}: {goal} kcal</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
