import React from "react";
import API from "../api/api";

const RecipeList = ({ recipes }) => {
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
          </div>
        ))
      ) : (
        <p>No recipes found</p>
      )}
    </div>
  );
};

export default RecipeList;
