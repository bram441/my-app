import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const AddForm = ({ selectedFood }) => {
  const [portionSize, setPortionSize] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFood || !portionSize) {
      setError("Selecteer voedsel en voer een portiegrootte in.");
      return;
    }

    const totalKcal = (portionSize / 100) * selectedFood.kcal_per_100;

    try {
      await API.post("/daily-entries", {
        food_id: selectedFood.id,
        total_kcal: totalKcal,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding daily entry:", error);
      setError("Fout bij het toevoegen van voedselinvoer.");
    }
  };

  return (
    <div style={{ flex: 1, padding: "20px" }}>
      <h2>Voedsel Toevoegen</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {selectedFood ? (
        <form onSubmit={handleSubmit}>
          <p>
            <strong>Geselecteerd:</strong> {selectedFood.name}
          </p>
          <label>Portiegrootte (gram/ml):</label>
          <input
            type="number"
            value={portionSize}
            onChange={(e) => setPortionSize(e.target.value)}
            required
          />
          <p>
            Totaal: {(portionSize / 100) * selectedFood.kcal_per_100 || 0} kcal
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
