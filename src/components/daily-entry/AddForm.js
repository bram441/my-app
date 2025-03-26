import { useState } from "react";
import API from "../../api/api";
import "../../components/css/toevoegenEten.css";

const AddForm = ({ selectedFood, setSelectedFood }) => {
  const [portionType, setPortionType] = useState("portion"); // "custom" or "portion"
  const [portionSize, setPortionSize] = useState(""); // Custom input (grams/ml)
  const [portionCount, setPortionCount] = useState(""); // Portion selection
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFood) {
      setError("Selecteer voedsel.");
      return;
    }

    let totalKcal = 0;
    let totalProteine = 0;
    let totalFats = 0;
    let totalSugar = 0;
    let amount = 1;

    if (portionType === "portion" && portionCount) {
      totalKcal = portionCount * selectedFood.kcal_per_portion;
      totalProteine =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.proteine_per_100) /
        100;
      totalFats =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.fats_per_100) /
        100;
      totalSugar =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.sugar_per_100) /
        100;
      amount = portionCount;
    } else if (portionType === "custom" && portionSize) {
      totalKcal = (portionSize / 100) * selectedFood.kcal_per_100;
      totalProteine = (portionSize / 100) * selectedFood.proteine_per_100;
      totalFats = (portionSize / 100) * selectedFood.fats_per_100;
      totalSugar = (portionSize / 100) * selectedFood.sugar_per_100;
      amount = parseFloat(
        (totalKcal / selectedFood.kcal_per_portion).toFixed(2)
      );
    } else {
      setError("Vul een geldige hoeveelheid in.");
      return;
    }

    try {
      await API.post("/daily-entries", {
        food_id: selectedFood.id,
        total_kcal: totalKcal,
        total_proteine: totalProteine,
        total_fats: totalFats,
        total_sugar: totalSugar,
        amount: amount,
      });
      setSelectedFood(null);
      setPortionCount("");
      setPortionSize("");
      setPortionType("portion");
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error("Error adding daily entry:", error);
      setError("Fout bij het toevoegen van voedselinvoer.");
    }
  };

  return (
    <div style={{ flex: 1, padding: "20px" }}>
      <h2>Voedsel Toevoegen</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {showConfirmation && (
        <p className="popup-message-success">Voedsel succesvol toegevoegd!</p>
      )}
      {selectedFood ? (
        <form className="addForm" onSubmit={handleSubmit}>
          <p>
            <strong>Geselecteerd:</strong> {selectedFood.name}
          </p>

          {/* Select input method */}
          <label>
            <input
              type="radio"
              name="portionType"
              value="portion"
              checked={portionType === "portion"}
              onChange={() => setPortionType("portion")}
            />
            Gebruik porties ({selectedFood.kcal_per_portion} kcal per portie)
          </label>
          <label>
            <input
              type="radio"
              name="portionType"
              value="custom"
              checked={portionType === "custom"}
              onChange={() => setPortionType("custom")}
            />
            Voer hoeveelheid handmatig in ({selectedFood.unit})
          </label>
          <br />
          <br />
          {/* Portion selection */}
          {portionType === "portion" && (
            <>
              <p>Porties beschrijving: {selectedFood.portion_description}</p>
              <label>Aantal porties: </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={portionCount}
                onChange={(e) => setPortionCount(e.target.value)}
                required
              />
            </>
          )}

          {/* Manual input */}
          {portionType === "custom" && (
            <>
              <label>Hoeveelheid in {selectedFood.unit}: </label>
              <input
                type="number"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                required
              />
            </>
          )}

          {/* Display calculated totals */}
          <p>
            Totaal kcal:{" "}
            {portionType === "portion"
              ? parseFloat(
                  (portionCount * selectedFood.kcal_per_portion).toFixed(2)
                ) || 0
              : parseFloat(
                  ((portionSize / 100) * selectedFood.kcal_per_100).toFixed(2)
                ) || 0}{" "}
            kcal
          </p>
          <p>
            Totaal proteine:{" "}
            {portionType === "portion"
              ? parseFloat(
                  (
                    (portionCount *
                      selectedFood.grams_per_portion *
                      selectedFood.proteine_per_100) /
                    100
                  ).toFixed(2)
                ) || 0
              : parseFloat(
                  ((portionSize / 100) * selectedFood.proteine_per_100).toFixed(
                    2
                  )
                ) || 0}{" "}
            g
          </p>
          <p>
            Totaal vet:{" "}
            {portionType === "portion"
              ? parseFloat(
                  (
                    (portionCount *
                      selectedFood.grams_per_portion *
                      selectedFood.fats_per_100) /
                    100
                  ).toFixed(2)
                ) || 0
              : parseFloat(
                  ((portionSize / 100) * selectedFood.fats_per_100).toFixed(2)
                ) || 0}{" "}
            g
          </p>
          <p>
            Totaal suiker:{" "}
            {portionType === "portion"
              ? parseFloat(
                  (
                    (portionCount *
                      selectedFood.grams_per_portion *
                      selectedFood.sugar_per_100) /
                    100
                  ).toFixed(2)
                ) || 0
              : parseFloat(
                  ((portionSize / 100) * selectedFood.sugar_per_100).toFixed(2)
                ) || 0}{" "}
            g
          </p>

          <button type="submit">Toevoegen</button>
        </form>
      ) : (
        <p>Selecteer voedsel aan de linkerkant</p>
      )}
    </div>
  );
};

export default AddForm;
