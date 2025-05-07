// FoodChatInput.js
import { useState, useContext } from "react";
import "../css/foodchat.css";
import API from "../../api/api"; // Adjust the import path as necessary
import { AuthContext } from "../../context/AuthContext";

const FoodChatInput = ({ onClose }) => {
  const { selectedDate } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const analyzeIntake = async () => {
    setLoading(true);
    try {
      const response = await API.post("/openai/analyze-intake", {
        message: input,
      });
      console.log("Response from OpenAI:", response.data.candidates);
      const enriched = response.data.map((item) => {
        const grams = item.grams;
        const calculated =
          grams != null && item.status === "matched"
            ? calculateNutrition(item, grams)
            : {};
        return { ...item, ...calculated, confirmed: false };
      });
      setSuggestions(enriched);
    } catch (err) {
      console.error("Failed to analyze input:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrition = (item, grams) => {
    if (!item || !item.match) return {};
    const usePortion =
      item.match.kcal_per_portion && item.match.grams_per_portion;
    const kcal = usePortion
      ? (item.match.kcal_per_portion / item.match.grams_per_portion) * grams
      : (item.kcal / 100) * grams;
    const proteins = (item.proteins / 100) * grams;
    const fats = (item.fats / 100) * grams;
    const sugar = (item.sugar / 100) * grams;
    return {
      calculated_kcal: kcal,
      calculated_proteins: proteins,
      calculated_fats: fats,
      calculated_sugar: sugar,
    };
  };

  const handleGramsChange = (index, value) => {
    const updated = [...suggestions];
    const grams = parseFloat(value);
    updated[index].grams = grams;
    if (updated[index].status === "matched") {
      Object.assign(updated[index], calculateNutrition(updated[index], grams));
    }
    setSuggestions(updated);
  };

  const handlePortionsChange = (index, value) => {
    const updated = [...suggestions];
    const gramsPerPortion = updated[index].match?.grams_per_portion || 0;
    const grams = gramsPerPortion * parseFloat(value);
    updated[index].grams = grams;
    if (updated[index].status === "matched") {
      Object.assign(updated[index], calculateNutrition(updated[index], grams));
    }
    setSuggestions(updated);
  };

  const handleCandidateSelect = (index, selectedId) => {
    const updated = [...suggestions];
    const selected = updated[index].candidates.find(
      (c) => c.id === parseInt(selectedId)
    );
    if (selected) {
      console.log("Selected candidate:", selected);
      if (updated[index].grams == null && updated[index].quantity != null) {
        updated[index].grams =
          selected.grams_per_portion * updated[index].quantity;
      }
      updated[index].match = selected;
      updated[index].kcal = selected.kcal_per_100;
      updated[index].proteins = selected.proteine_per_100;
      updated[index].fats = selected.fats_per_100;
      updated[index].sugar = selected.sugar_per_100;
      updated[index].portion_description = selected.portion_description;
      updated[index].status =
        updated[index].grams == null ? "missing_quantity" : "matched";
      updated[index].candidates = [];
      if (updated[index].grams != null) {
        Object.assign(
          updated[index],
          calculateNutrition(updated[index], updated[index].grams)
        );
      }
    }
    setSuggestions(updated);
  };

  const isReadyToConfirm = suggestions.every(
    (item) => item.status === "matched" && item.grams != null
  );

  const confirmAll = async () => {
    if (!isReadyToConfirm)
      return alert("Niet alle items zijn bevestigd of volledig.");
    try {
      const formatted = suggestions.map((item) => ({
        food_id: item.match.id,
        date: selectedDate.toISOString().split("T")[0],
        total_kcal: Math.round(item.calculated_kcal),
        total_proteins: Math.round(item.calculated_proteins),
        total_fats: Math.round(item.calculated_fats),
        total_sugar: Math.round(item.calculated_sugar),
      }));
      await Promise.all(
        formatted.map((entry) => API.post("/daily-entries", entry))
      );
      console.log("Ingevoerde items toegevoegd:", formatted);
      onClose();
    } catch (err) {
      console.error("Fout bij opslaan van entries:", err);
    }
  };

  const rejectAll = () => {
    setSuggestions([]);
  };

  return (
    <div className="foodchat-modal">
      <div className="foodchat-header">
        <h2>Voedingschat</h2>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Typ hier wat je gegeten hebt vandaag..."
        rows={8}
        style={{ width: "100%", minHeight: "5rem" }}
      />
      <button onClick={analyzeIntake} disabled={loading}>
        {loading ? "Analyseren..." : "Analyseer"}
      </button>

      {suggestions.length > 0 && (
        <div className="suggestions-list">
          <h3>Voorstellen:</h3>
          {suggestions.map((item, i) => (
            <div key={i} className="suggestion-item">
              <p>
                <strong>{item.input_name}</strong> (
                {item.portion_description || "onbekend"}) -{" "}
                {item.status === "matched" && item.calculated_kcal != null
                  ? `${Math.round(item.calculated_kcal)} kcal`
                  : "? kcal"}
              </p>
              <p>Status: {item.status}</p>

              {item.status === "matched" && item.grams != null && (
                <ul className="nutrition-values">
                  <li>Eiwitten: {Math.round(item.calculated_proteins)}g</li>
                  <li>Vetten: {Math.round(item.calculated_fats)}g</li>
                  <li>Suikers: {Math.round(item.calculated_sugar)}g</li>
                </ul>
              )}

              {item.status === "ambiguous_match" && (
                <select
                  onChange={(e) => handleCandidateSelect(i, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Kies juiste optie
                  </option>
                  {item.candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.kcal_per_portion || c.kcal_per_100} kcal)
                    </option>
                  ))}
                </select>
              )}

              {item.grams == null &&
                item.quantity == null &&
                (item.match?.grams_per_portion ? (
                  <input
                    type="number"
                    placeholder="Aantal porties"
                    onChange={(e) => handlePortionsChange(i, e.target.value)}
                  />
                ) : (
                  <input
                    type="number"
                    placeholder="Hoeveel gram/ml?"
                    onChange={(e) => handleGramsChange(i, e.target.value)}
                  />
                ))}
            </div>
          ))}

          <div className="actions">
            <button disabled={!isReadyToConfirm} onClick={confirmAll}>
              ✅ Alles bevestigen
            </button>
            <button onClick={rejectAll}>❌ Alles verwijderen</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodChatInput;
