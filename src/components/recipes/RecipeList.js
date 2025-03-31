import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

import API from "../../api/api";
import Popup from "../common/Popup.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker CSS

const RecipeList = ({ recipes, onClickFoodList, userId, role, navigate }) => {
  const { selectedDate, setSelectedDate } = useContext(AuthContext);
  const [isDeletePopupOpen, setDeletePopupOpen] = useState(false);
  const [isAddPopupOpen, setAddPopupOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [portion, setPortion] = useState(null); // Default portion size is 1

  const addRecipeToDailyEntry = async () => {
    if (!selectedRecipe) return;

    try {
      const totalKcal = selectedRecipe.total_kcals * (portion || 1);
      const totalProteins = selectedRecipe.total_proteins * (portion || 1);
      const totalFats = selectedRecipe.total_fats * (portion || 1);
      const totalSugars = selectedRecipe.total_sugars * (portion || 1);

      await API.post("/daily-entries", {
        food_id: null,
        recipe_id: selectedRecipe.id,
        total_kcal: totalKcal,
        total_proteins: totalProteins,
        total_fats: totalFats,
        total_sugars: totalSugars,
        amount: portion || 1,
        date: selectedDate.toISOString().split("T")[0], // Include selected date
        entry_type: "recipe",
      });

      alert("Recipe added to daily entries!");
      setAddPopupOpen(false); // Close the popup after adding
    } catch (error) {
      console.error("Error adding recipe to daily entries:", error);
    }
  };
  const onClickDelete = async (recipe) => {
    setSelectedRecipe(recipe);
    setDeletePopupOpen(true);
  };

  return (
    <div className="recipe-list">
      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-item">
            <h3>{recipe.name}</h3>
            <p>Total Kcal: {recipe.total_kcals.toFixed(2)}</p>
            <p>
              Proteins: {(recipe.total_proteins ?? 0).toFixed(2)} g | Fats:{" "}
              {(recipe.total_fats ?? 0).toFixed(2)} g | Sugars:{" "}
              {(recipe.total_sugars ?? 0).toFixed(2)} g
            </p>
            <button
              onClick={() => {
                setSelectedRecipe(recipe);
                setAddPopupOpen(true);
              }}
            >
              Add to Daily Entries
            </button>
            <FontAwesomeIcon
              icon={faInfoCircle}
              onClick={() => onClickFoodList(recipe)}
              className="info-icon"
            />
            {(userId === recipe.user_id || role === "admin") && (
              <FontAwesomeIcon
                icon={faEdit}
                onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                className="edit-icon"
              />
            )}
            {(userId === recipe.user_id || role === "admin") && (
              <FontAwesomeIcon
                icon={faTrash}
                onClick={() => onClickDelete(recipe)}
                className="trash-icon"
              />
            )}
          </div>
        ))
      ) : (
        <p className="non-found">No recipes found</p>
      )}

      {/* Delete Recipe Popup */}
      <Popup
        isOpen={isDeletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
      >
        <h2 style={{ paddingTop: "20px" }}>
          Are you sure you want to delete this recipe?
        </h2>
        <button
          onClick={async () => {
            try {
              await API.delete(`/recipes/${selectedRecipe.id}`);
              setDeletePopupOpen(false);
              navigate("/dashboard");
            } catch (error) {
              console.error("Error deleting recipe:", error);
            }
          }}
          className="delete-button-confirm"
        >
          Yes
        </button>
        <button
          className="delete-button-deny"
          onClick={() => setDeletePopupOpen(false)}
        >
          No
        </button>
      </Popup>

      {/* Add to Daily Entries Popup */}
      <Popup isOpen={isAddPopupOpen} onClose={() => setAddPopupOpen(false)}>
        <h2 style={{ paddingTop: "20px" }}>
          Add {selectedRecipe?.name} to Daily Entries
        </h2>
        <p>
          How many portions of {selectedRecipe?.name} would you like to add to
          your daily entries?
        </p>
        {/* Date Picker */}
        <div className="form-group">
          <label>Datum:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <input
          type="number"
          step="0.01"
          min="0.1"
          value={portion || ""} // Show an empty string if portion is null
          onChange={(e) =>
            setPortion(
              e.target.value === "" ? null : parseFloat(e.target.value)
            )
          } // Allow empty input
          className="portion-input"
        />
        <p>
          Total Kcal:{" "}
          {selectedRecipe
            ? (selectedRecipe.total_kcals * (portion || 0)).toFixed(2)
            : 0}
        </p>
        <button
          className="confirm-button"
          onClick={() => {
            if (portion && portion > 0) {
              addRecipeToDailyEntry();
            } else {
              alert("Please enter a valid portion size.");
            }
          }}
        >
          Add
        </button>
        <button className="close-button" onClick={() => setAddPopupOpen(false)}>
          Cancel
        </button>
      </Popup>
    </div>
  );
};

export default RecipeList;
