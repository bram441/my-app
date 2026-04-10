import React from "react";
import "../css/recipeSearch.css"; // Import the new CSS file
import { useLanguage } from "../../context/LanguageContext";

const RecipeSearch = ({ searchTerm, setSearchTerm }) => {
  const { t } = useLanguage();
  return (
    <div className="recipe-search">
      <input
        type="text"
        placeholder={t("recipes.searchRecipes")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="recipe-search-input" // Add a class for styling
      />
    </div>
  );
};

export default RecipeSearch;
