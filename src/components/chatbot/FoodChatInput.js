// FoodChatInput.js
import { useState, useContext } from "react";
import "../css/foodchat.css";
import API from "../../api/api"; // Adjust the import path as necessary
import { AuthContext } from "../../context/AuthContext";
import SuggestionItem from "./SuggestionItem";

const FoodChatInput = ({ onClose, refreshDailyEntries }) => {
  const { selectedDate } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const analyzeIntake = async () => {
    setLoading(true);
    try {
      const response = await API.post("/openai/analyze-intake", {
        message: input,
      });
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
    const proteins = ((item.proteins ?? 0) / 100) * grams;
    const fats = ((item.fats ?? 0) / 100) * grams;
    const sugar = ((item.sugar ?? 0) / 100) * grams;
    return {
      calculated_kcal: kcal,
      calculated_proteins: proteins,
      calculated_fats: fats,
      calculated_sugar: sugar,
    };
  };

  const handlePortionsChange = (index, value) => {
    const updated = [...suggestions];
    const gramsPerPortion = updated[index].match?.grams_per_portion || 0;
    const quantity = parseFloat(value);
    updated[index].quantity = quantity;
    updated[index].grams = gramsPerPortion * quantity; // Synchronize grams
    if (
      updated[index].status === "matched" ||
      updated[index].status === "missing_quantity"
    ) {
      Object.assign(
        updated[index],
        calculateNutrition(updated[index], updated[index].grams)
      );
      updated[index].status = "matched"; // Update status to matched
    }
    setSuggestions(updated);
  };

  const handleGramsChange = (index, value) => {
    const updated = [...suggestions];
    const grams = parseFloat(value);
    const gramsPerPortion = updated[index].match?.grams_per_portion || 0;
    updated[index].grams = grams;
    updated[index].quantity = gramsPerPortion
      ? grams / gramsPerPortion // Synchronize portions
      : null;
    if (
      updated[index].status === "matched" ||
      updated[index].status === "missing_quantity"
    ) {
      Object.assign(updated[index], calculateNutrition(updated[index], grams));
      updated[index].status = "matched"; // Update status to matched
    }
    setSuggestions(updated);
  };

  const handleCandidateSelect = (index, selectedId) => {
    const updated = [...suggestions];
    const selected = updated[index].candidates.find(
      (c) => c.id === parseInt(selectedId)
    );
    if (selected) {
      const gramsPerPortion = selected.grams_per_portion || 0;

      // Update match and calculate both fields
      updated[index].match = selected;
      updated[index].input_name = selected.name;
      updated[index].kcal = selected.kcal_per_100;
      updated[index].proteins = selected.proteine_per_100;
      updated[index].fats = selected.fats_per_100;
      updated[index].sugar = selected.sugar_per_100;
      updated[index].portion_description = selected.portion_description;

      if (updated[index].quantity != null && gramsPerPortion) {
        updated[index].grams = updated[index].quantity * gramsPerPortion;
      } else if (updated[index].grams != null && gramsPerPortion) {
        updated[index].quantity = updated[index].grams / gramsPerPortion;
      }

      updated[index].status =
        updated[index].grams == null && updated[index].quantity == null
          ? "missing_quantity"
          : "matched"; // Update status
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
  const removeItem = (index) => {
    const updated = [...suggestions];
    updated.splice(index, 1); // Remove the item at the specified index
    setSuggestions(updated);
  };

  const isReadyToConfirm = suggestions.every(
    (item) =>
      (item.status === "matched" && item.grams != null) ||
      item.status === "no match"
  );

  const confirmAll = async () => {
    if (!isReadyToConfirm)
      return alert("Niet alle items zijn bevestigd of volledig.");
    try {
      const formatted = suggestions
        .filter((item) => item.status === "matched") // Exclude "no match" items
        .map((item) => {
          const amount =
            item.match.kcal_per_portion && item.calculated_kcal
              ? item.calculated_kcal / item.match.kcal_per_portion
              : 1; // Default to 1 if kcal_per_portion is not available

          return {
            food_id: item.match.id,
            date: selectedDate.toISOString().split("T")[0],
            total_kcal: Math.round(item.calculated_kcal),
            total_proteins: Math.round(item.calculated_proteins),
            total_fats: Math.round(item.calculated_fats),
            total_sugar: Math.round(item.calculated_sugar),
            amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
          };
        });

      await Promise.all(
        formatted.map((entry) => API.post("/daily-entries", entry))
      );
      refreshDailyEntries();
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
        {loading
          ? "Analyseren..."
          : suggestions.length > 0
          ? "Heranalyseer"
          : "Analyseer"}
      </button>
      {suggestions.length > 0 && (
        <>
          <h3>Voorstellen:</h3>
          <div className="suggestions-list">
            {suggestions.map((item, i) => (
              <SuggestionItem
                key={i}
                item={item}
                index={i}
                handlePortionsChange={handlePortionsChange}
                handleGramsChange={handleGramsChange}
                handleCandidateSelect={handleCandidateSelect}
                removeItem={removeItem}
              />
            ))}
          </div>
          <div className="actions">
            <button disabled={!isReadyToConfirm} onClick={confirmAll}>
              ✅ Alles bevestigen
            </button>
            <button onClick={rejectAll}>❌ Alles verwijderen</button>
          </div>
        </>
      )}
    </div>
  );
};

export default FoodChatInput;
