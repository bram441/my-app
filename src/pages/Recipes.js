import { useState, useEffect } from "react";
import NavigationBar from "../components/NavigationBar";
import RecipeSearch from "../components/RecipeSearch";
import RecipeList from "../components/RecipeList";
import API from "../api/api";
import "../components/css/recipes.css"; // Create this CSS file for styling

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await API.get("/recipes");
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <div className="recipes-container">
        <RecipeSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <RecipeList recipes={filteredRecipes} />
      </div>
    </div>
  );
};

export default Recipes;
