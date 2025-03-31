import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/api";
import "../../components/css/toevoegenEten.css";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker CSS

const AddForm = ({ selectedFood, setSelectedFood }) => {
  const { selectedDate, setSelectedDate } = useContext(AuthContext);
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
    let totalProteins = 0;
    let totalFats = 0;
    let totalSugars = 0;
    let amount = 1;

    if (portionType === "portion" && portionCount) {
      totalKcal = portionCount * selectedFood.kcal_per_portion;
      totalProteins =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.proteine_per_100) /
        100;
      totalFats =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.fats_per_100) /
        100;
      totalSugars =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.sugar_per_100) /
        100;
      amount = portionCount;
    } else if (portionType === "custom" && portionSize) {
      totalKcal = (portionSize / 100) * selectedFood.kcal_per_100;
      totalProteins = (portionSize / 100) * selectedFood.proteine_per_100;
      totalFats = (portionSize / 100) * selectedFood.fats_per_100;
      totalSugars = (portionSize / 100) * selectedFood.sugar_per_100;
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
        total_proteins: totalProteins,
        total_fats: totalFats,
        total_sugars: totalSugars,
        amount: amount,
        date: selectedDate.toISOString().split("T")[0], // Include selected date
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
        <form onSubmit={handleSubmit} className="add-form">
          <h3>Voeg Voedsel Toe</h3>
          {error && <p className="error">{error}</p>}
          {showConfirmation && <p className="success">Voedsel toegevoegd!</p>}

          {/* Date Picker */}
          <div className="form-group">
            <label>Datum:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {/* Portion Type Selection */}
          <div className="form-group">
            <label>Hoeveelheidstype:</label>
            <select
              value={portionType}
              onChange={(e) => setPortionType(e.target.value)}
            >
              <option value="portion">Portie</option>
              <option value="custom">Aangepast (gram/ml)</option>
            </select>
          </div>

          {/* Portion Count or Custom Size */}
          {portionType === "portion" ? (
            <div className="form-group">
              <label>Aantal porties:</label>
              <input
                type="number"
                value={portionCount}
                onChange={(e) => setPortionCount(e.target.value)}
                min="0.01"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Hoeveelheid (gram/ml):</label>
              <input
                type="number"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                min="0.01"
              />
            </div>
          )}

          {/* Portion Description */}
          <div className="portion-description">
            <p>
              {portionType === "portion" ? (
                <>
                  Een portie bevat {selectedFood.kcal_per_portion} kcal.
                  <br />
                  Beschrijving: {selectedFood.portion_description}.
                </>
              ) : (
                "Aangepaste hoeveelheid wordt berekend op basis van gram/ml."
              )}
            </p>
          </div>

          {/* Styled container for calculated totals */}
          <div className="calculated-totals">
            <h4>Berekening:</h4>
            <p>
              <strong>Totaal kcal:</strong>{" "}
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
              <strong>Totaal proteïne:</strong>{" "}
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
                    (
                      (portionSize / 100) *
                      selectedFood.proteine_per_100
                    ).toFixed(2)
                  ) || 0}{" "}
              g
            </p>
            <p>
              <strong>Totaal vet:</strong>{" "}
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
              <strong>Totaal suiker:</strong>{" "}
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
                    ((portionSize / 100) * selectedFood.sugar_per_100).toFixed(
                      2
                    )
                  ) || 0}{" "}
              g
            </p>
          </div>

          {/* Submit Button */}
          <br />
          <button type="submit" className="btn btn-primary">
            Voeg Toe
          </button>
        </form>
      ) : (
        <p>Selecteer voedsel aan de linkerkant</p>
      )}
    </div>
  );
};

export default AddForm;
