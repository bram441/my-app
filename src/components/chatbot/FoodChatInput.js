// FoodChatInput.js
import { useState } from "react";
import "../css/foodchat.css";
import API from "../../api/api"; // Adjust the import path as necessary
import { AuthContext } from "../context/AuthContext";

const FoodChatInput = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const analyzeIntake = async () => {
    setLoading(true);
    try {
      const response = await API.post("/openai/analyze-intake", {
        message: input,
      });
      const enriched = response.data.map((item) => ({
        ...item,
        confirmed: false,
      }));
      setSuggestions(enriched);
      console.log("Suggestions:", enriched);
    } catch (err) {
      console.error("Failed to analyze input:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGramsChange = (index, value) => {
    const updated = [...suggestions];
    updated[index].grams = parseFloat(value);
    setSuggestions(updated);
  };

  const handlePortionsChange = (index, value) => {
    const updated = [...suggestions];
    const match = updated[index].match;
    const gramsPerPortion = match?.grams_per_portion || 0;
    updated[index].grams = gramsPerPortion * parseFloat(value);
    setSuggestions(updated);
  };

  const handleCandidateSelect = (index, selectedId) => {
    const updated = [...suggestions];
    const selected = updated[index].candidates.find(
      (c) => c.id === parseInt(selectedId)
    );
    if (selected) {
      updated[index].match = selected;
      updated[index].kcal = selected.kcal_per_portion;
      updated[index].proteins = selected.proteine_per_100;
      updated[index].fats = selected.fats_per_100;
      updated[index].sugar = selected.sugar_per_100;
      updated[index].portion_description = selected.portion_description;
      updated[index].status =
        updated[index].grams == null ? "missing_quantity" : "matched";
      updated[index].candidates = [];
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
        total_kcal: Math.round((item.kcal / 100) * item.grams),
      }));
      await Promise.all(
        formatted.map((entry) => axios.post("/daily_entries", entry))
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
        <button onClick={onClose}>X</button>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Typ hier wat je gegeten hebt vandaag..."
        rows={4}
        style={{ width: "100%" }}
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
                {item.portion_description || "onbekend"}) - {item.kcal} kcal
              </p>
              <p>Status: {item.status}</p>

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
                      {c.name} ({c.kcal_per_portion} kcal)
                    </option>
                  ))}
                </select>
              )}

              {item.match?.grams_per_portion ? (
                <input
                  type="number"
                  placeholder="Aantal porties"
                  onChange={(e) => handlePortionsChange(i, e.target.value)}
                />
              ) : (
                item.grams == null && (
                  <input
                    type="number"
                    placeholder="Hoeveel gram/ml?"
                    onChange={(e) => handleGramsChange(i, e.target.value)}
                  />
                )
              )}
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
