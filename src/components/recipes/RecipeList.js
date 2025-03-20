import { useState } from "react";
import API from "../../api/api";
import Popup from "../common/Popup.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const RecipeList = ({ recipes, onClickFoodList, userId, role, navigate }) => {
  const [isPopupOpen, setPopupOpen] = useState(false);

  const addRecipeToDailyEntry = async (recipe) => {
    try {
      const totalKcal = recipe.total_kcals;
      await API.post("/daily-entries", {
        food_id: null,
        recipe_id: recipe.id,
        total_kcal: totalKcal,
        amount: 1,
        entry_type: "recipe",
      });
      alert("Recipe added to daily entries!");
    } catch (error) {
      console.error("Error adding recipe to daily entries:", error);
    }
  };

  return (
    <div className="recipe-list">
      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-item">
            <h3>{recipe.name}</h3>
            <p>Total Kcal: {recipe.total_kcals}</p>
            <button onClick={() => addRecipeToDailyEntry(recipe)}>
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
                onClick={() => setPopupOpen(true)}
                className="trash-icon"
              />
            )}
            <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
              <h2 style={{ "padding-top": "20px" }}>
                Are you sure you want to delete this recipe?
              </h2>
              <button
                onClick={async () => {
                  try {
                    await API.delete(`/recipes/${recipe.id}`);
                    setPopupOpen(false);
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
                onClick={() => setPopupOpen(false)}
              >
                No
              </button>
            </Popup>
          </div>
        ))
      ) : (
        <p className="non-found">No recipes found</p>
      )}
    </div>
  );
};

export default RecipeList;
