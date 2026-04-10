import { useState, useEffect, useCallback, useContext } from "react";
import NavigationBar from "../components/common/NavigationBar";
import RecipeSearch from "../components/recipes/RecipeSearch";
import RecipeList from "../components/recipes/RecipeList";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Popup from "../components/common/Popup";
import FoodList from "../components/recipes/RecipeFoodList";
import { AuthContext } from "../context/AuthContext";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import PageShell from "../components/ui/PageShell";
import SectionCard from "../components/ui/SectionCard";
import AppButton from "../components/ui/AppButton";

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
  const { user } = useContext(AuthContext);

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
    <>
      <header>
        <NavigationBar />
      </header>
      <PageShell>
        <SectionCard title="Recipes">
          <Stack spacing={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth size="small">
                  <InputLabel id="recipe-filter">Filter Recipes</InputLabel>
                  <Select
                    labelId="recipe-filter"
                    label="Filter Recipes"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Recipes</MenuItem>
                    <MenuItem value="user">User Recipes</MenuItem>
                    <MenuItem value="shared">Shared Recipes</MenuItem>
                    <MenuItem value="userShared">User Shared Recipes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppButton fullWidth onClick={() => navigate("/add-recipe")}>
                  Add Recipe
                </AppButton>
              </Grid>
            </Grid>
            <RecipeSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <RecipeList
              recipes={filteredRecipes}
              onClickFoodList={onClickFoodList}
              userId={user?.id}
              role={user?.role}
              navigate={navigate}
            />
          </Stack>
        </SectionCard>
        <Popup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Food items in recipe: {selectedRecipe.name}
          </Typography>
          <FoodList foods={selectedRecipe.foods} />
        </Popup>
      </PageShell>
    </>
  );
};

export default Recipes;
