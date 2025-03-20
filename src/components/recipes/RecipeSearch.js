import React from "react";
import "../css/recipeSearch.css"; // Import the new CSS file

const RecipeSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="recipe-search">
      <input
        type="text"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="recipe-search-input" // Add a class for styling
      />
    </div>
  );
};

export default RecipeSearch;
