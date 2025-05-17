import { useState, useEffect } from "react";
import "../css/foodchat.css";

const SuggestionItem = ({
  item,
  index,
  handlePortionsChange,
  handleGramsChange,
  handleCandidateSelect,
  removeItem,
}) => {
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [localQuantity, setLocalQuantity] = useState(item.quantity || ""); // Local state for portions
  const [localGrams, setLocalGrams] = useState(item.grams || ""); // Local state for grams

  // Reset local state when the item prop changes (e.g., after reanalysis)
  useEffect(() => {
    const gramsPerPortion = item.match?.grams_per_portion || 0;

    // Automatically calculate and fill both fields if possible
    if (item.quantity != null && gramsPerPortion) {
      setLocalQuantity(item.quantity);
      setLocalGrams(item.quantity * gramsPerPortion);
    } else if (item.grams != null && gramsPerPortion) {
      setLocalGrams(item.grams);
      setLocalQuantity(item.grams / gramsPerPortion);
    } else {
      setLocalQuantity(item.quantity || "");
      setLocalGrams(item.grams || "");
    }
  }, [item]);

  const handleSave = () => {
    // Save changes and exit edit mode
    handlePortionsChange(index, localQuantity);
    handleGramsChange(index, localGrams);
    setIsEditing(false);
  };

  const handleQuantityChange = (value) => {
    const gramsPerPortion = item.match?.grams_per_portion || 0;
    setLocalQuantity(value);
    setLocalGrams(value * gramsPerPortion); // Synchronize grams
  };

  const handleGramsChangeLocal = (value) => {
    const gramsPerPortion = item.match?.grams_per_portion || 0;
    setLocalGrams(value);
    setLocalQuantity(gramsPerPortion ? value / gramsPerPortion : ""); // Synchronize portions
  };

  return (
    <div className="suggestion-item">
      <p>
        <strong>{item.input_name}</strong> (
        {item.quantity
          ? `${parseFloat(item.quantity).toFixed(2)}x`
          : item.grams
          ? `${parseFloat(item.grams).toFixed(2)} gr/ml`
          : "onbekend"}
        ) -{" "}
        {item.status === "matched" && item.calculated_kcal != null
          ? `${Math.round(item.calculated_kcal)} kcal`
          : "? kcal"}
      </p>
      <p>
        Status:{" "}
        {item.status === "ambiguous_match" && item.grams == null
          ? "Meerdere opties gevonden en hoeveelheid ontbreekt"
          : item.status === "ambiguous_match"
          ? "Meerdere opties gevonden, kies de juiste"
          : item.status === "missing_quantity"
          ? "Hoeveelheid ontbreekt, vul deze in"
          : item.status === "no match"
          ? "Geen match gevonden, dit item wordt niet toegevoegd"
          : item.status}
      </p>

      {item.status === "matched" && item.grams != null && (
        <ul className="nutrition-values">
          <li>Eiwitten: {Math.round(item.calculated_proteins)}g</li>
          <li>Vetten: {Math.round(item.calculated_fats)}g</li>
          <li>Suikers: {Math.round(item.calculated_sugar)}g</li>
        </ul>
      )}

      {item.status === "ambiguous_match" && (
        <select
          onChange={(e) => handleCandidateSelect(index, e.target.value)}
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

      {item.status !== "no match" && (
        <>
          {isEditing ||
          item.status === "missing_quantity" ||
          item.grams == null ? (
            <>
              <input
                type="number"
                placeholder="Aantal porties"
                min={0}
                step={0.01}
                value={localQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)} // Synchronize grams
              />
              <input
                type="number"
                placeholder="Hoeveel gram/ml?"
                min={0}
                step={0.01}
                value={localGrams}
                onChange={(e) => handleGramsChangeLocal(e.target.value)} // Synchronize portions
              />
              <button onClick={handleSave}>Opslaan</button>
            </>
          ) : (
            <>
              <p>
                {item.quantity
                  ? `Aantal porties: ${parseFloat(item.quantity).toFixed(2)}`
                  : `Hoeveel gram/ml: ${parseFloat(item.grams).toFixed(2)}`}
              </p>
            </>
          )}
        </>
      )}
      <div className="actions-suggestion-item">
        {item.status === "matched" && (item.quantity || item.grams) && (
          <button
            onClick={() => setIsEditing(true)} // Enter edit mode
            className="edit-btn"
          >
            Bewerken
          </button>
        )}
        <button onClick={() => removeItem(index)} className="delete-btn">
          Verwijder
        </button>
      </div>
    </div>
  );
};

export default SuggestionItem;
