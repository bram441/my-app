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
import { useLanguage } from "../context/LanguageContext";

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
  const { t } = useLanguage();

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
        <SectionCard title={t("recipes.title")}>
          <Stack spacing={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth size="small">
                  <InputLabel id="recipe-filter">{t("recipes.filterRecipes")}</InputLabel>
                  <Select
                    labelId="recipe-filter"
                    label={t("recipes.filterRecipes")}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <MenuItem value="all">{t("recipes.allRecipes")}</MenuItem>
                    <MenuItem value="user">{t("recipes.userRecipes")}</MenuItem>
                    <MenuItem value="shared">{t("recipes.sharedRecipes")}</MenuItem>
                    <MenuItem value="userShared">{t("recipes.userSharedRecipes")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <AppButton fullWidth onClick={() => navigate("/add-recipe")}>
                  {t("recipes.addRecipe")}
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
            {t("recipes.foodItemsInRecipe")}: {selectedRecipe.name}
          </Typography>
          <FoodList foods={selectedRecipe.foods} />
        </Popup>
      </PageShell>
    </>
  );
};

export default Recipes;
