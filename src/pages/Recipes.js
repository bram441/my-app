import { useState, useEffect, useCallback } from "react";
import NavigationBar from "../components/NavigationBar";
import RecipeSearch from "../components/recipes/RecipeSearch";
import RecipeList from "../components/recipes/RecipeList";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../components/css/recipes.css"; // Create this CSS file for styling
import Popup from "../components/common/Popup";
import FoodList from "../components/recipes/RecipeFoodList";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [sharedRecipes, setSharedRecipes] = useState([]);
  const [userSharedRecipes, setUserSharedRecipes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await API.get("/recipes");
        const userRecipes = await API.get("/recipes/user");
        const sharedRecipes = await API.get("/recipes/shared");
        const userSharedRecipes = await API.get("/recipes/all");
        setAllRecipes(response.data);
        setUserRecipes(userRecipes.data);
        setSharedRecipes(sharedRecipes.data);
        setUserSharedRecipes(userSharedRecipes.data);
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };
    fetchRecipes();
  }, []);

  useEffect(() => {
    switch (filter) {
      case "user":
        setRecipes(userRecipes);
        break;
      case "shared":
        setRecipes(sharedRecipes);
        break;
      case "userShared":
        setRecipes(userSharedRecipes);
        break;
      default:
        setRecipes(allRecipes);
        break;
    }
  }, [filter, allRecipes, userRecipes, sharedRecipes, userSharedRecipes]);

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
        <div className="filter-container">
          <label htmlFor="recipe-filter">Filter Recipes: </label>
          <select
            id="recipe-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Recipes</option>
            <option value="user">User Recipes</option>
            <option value="shared">Shared Recipes</option>
            <option value="userShared">User Shared Recipes</option>
          </select>
          <button onClick={() => navigate("/add-recipe")}>Add Recipe</button>
        </div>
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
