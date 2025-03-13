import { useState, useEffect, useCallback } from "react";
import NavigationBar from "../components/NavigationBar";
import RecipeSearch from "../components/RecipeSearch";
import RecipeList from "../components/RecipeList";
import API from "../api/api";
import "../components/css/recipes.css"; // Create this CSS file for styling
import Popup from "../components/Popup";
import FoodList from "../components/FoodList";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState({});

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

  const onClickFoodList = useCallback((recipe) => {
    setSelectedRecipe(recipe);
    setPopupOpen(true);
  }, []);

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <div className="recipes-container">
        <RecipeSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <RecipeList
          recipes={filteredRecipes}
          onClickFoodList={onClickFoodList}
        />
      </div>
      <div>
        <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
          <h2>Food items in recipe: {selectedRecipe.name}</h2>
          <FoodList foods={selectedRecipe.foods} />
        </Popup>
      </div>
    </div>
  );
};

export default Recipes;
