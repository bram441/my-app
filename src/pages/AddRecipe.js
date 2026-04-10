import { useState, useEffect } from "react";
import API from "../api/api";
import NavigationBar from "../components/common/NavigationBar";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PageShell from "../components/ui/PageShell";
import SectionCard from "../components/ui/SectionCard";
import AppButton from "../components/ui/AppButton";
import { useLanguage } from "../context/LanguageContext";

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    name: "",
    food_quantities: {},
    total_kcals: 0,
    total_proteins: 0,
    total_fats: 0,
    total_sugars: 0,
    user_ids: [],
  });
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFoodChange = (foodId, quantity) => {
    setFormData((prevData) => {
      const newFoodQuantities = { ...prevData.food_quantities };

      if (quantity > 0) {
        // Add or update the food quantity
        newFoodQuantities[foodId] = quantity;
      } else {
        // Remove the food from the list if quantity is 0
        delete newFoodQuantities[foodId];
      }

      const totals = Object.entries(newFoodQuantities).reduce(
        (totals, [id, qty]) => {
          const food = foods.find((food) => food.id === parseInt(id));
          if (food) {
            totals.kcals += (food.kcal_per_100 / 100) * qty;
            totals.proteins += (food.proteine_per_100 / 100) * qty;
            totals.fats += (food.fats_per_100 / 100) * qty;
            totals.sugars += (food.sugar_per_100 / 100) * qty;
          }
          return totals;
        },
        { kcals: 0, proteins: 0, fats: 0, sugars: 0 }
      );

      console.log("totals:", totals);
      return {
        ...prevData,
        food_quantities: newFoodQuantities,
        total_kcals: totals.kcals,
        total_proteins: totals.proteins,
        total_fats: totals.fats,
        total_sugars: totals.sugars,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(formData.food_quantities).length === 0) {
      setError(t("recipes.addIngredientFirst"));
      return;
    }
    try {
      console.log("formData:", formData);
      await API.post("/recipes", formData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding recipe:", error);
      setError(t("recipes.addRecipeFailed"));
    }
  };

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await API.get("/foods");
        setFoods(response.data);
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };
    fetchFoods();
  }, []);

  useEffect(() => {
    const results = foods.filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFoods(results);
  }, [searchTerm, foods]);

  const addedIngredients = Object.entries(formData.food_quantities).map(
    ([id, qty]) => {
      const food = foods.find((food) => food.id === parseInt(id));
      return {
        id,
        name: food?.name || t("recipes.unknownFood"),
        amount: qty,
        kcal: food ? (food.kcal_per_100 / 100) * qty : 0,
        proteins: food ? (food.proteine_per_100 / 100) * qty : 0,
        fats: food ? (food.fats_per_100 / 100) * qty : 0,
        sugars: food ? (food.sugar_per_100 / 100) * qty : 0,
      };
    }
  );

  return (
    <>
      <header>
        <NavigationBar />
      </header>
      <PageShell>
        <SectionCard title={t("recipes.addNewRecipe")}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack component="form" spacing={1.5} onSubmit={handleSubmit}>
            <TextField
            size="small"
            type="text"
            name="name"
            label={t("recipes.recipeName")}
            onChange={handleChange}
            required
          />
            <TextField
            size="small"
            type="text"
            label={t("recipes.searchFood")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
            <Box sx={{ maxHeight: 360, overflowY: "auto", pr: 0.5 }}>
            {filteredFoods.map((food) => (
                <Box key={food.id} sx={{ mb: 1.25, p: 1, borderRadius: 2, bgcolor: "rgba(15,23,42,0.03)" }}>
                  <Typography fontWeight={700}>{food.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {food.kcal_per_100} {t("recipes.kcalPer100")}/{food.unit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {food.portion_description}
                  </Typography>
                  <TextField
                  size="small"
                  sx={{ mt: 1 }}
                  type="number"
                  min="0"
                  label={t("recipes.quantityInGrams")}
                  onChange={(e) =>
                    handleFoodChange(food.id, parseInt(e.target.value))
                  }
                />
                </Box>
            ))}
            </Box>
            <Typography variant="h6">{t("recipes.recipeTotals")}</Typography>
            <Typography>{t("weekly.totalKcal")}: {parseFloat(formData.total_kcals).toFixed(2)} kcal</Typography>
            <Typography>
            {t("daily.proteins")}: {parseFloat(formData.total_proteins).toFixed(2)} g | {t("daily.fats")}:{" "}
            {parseFloat(formData.total_fats).toFixed(2)} g | {t("daily.sugars")}:{" "}
            {parseFloat(formData.total_sugars).toFixed(2)} g
            </Typography>
            <AppButton type="submit">{t("recipes.addRecipe")}</AppButton>
          </Stack>
        </SectionCard>
        <SectionCard title={t("recipes.addedIngredients")} sx={{ mt: 2 }}>
          {addedIngredients.length > 0 ? (
            <List>
              {addedIngredients.map((ingredient) => (
                <ListItem key={ingredient.id} divider>
                  <ListItemText
                    primary={`${ingredient.name} - ${ingredient.amount}g`}
                    secondary={`${ingredient.kcal.toFixed(
                      2
                    )} kcal | Proteins: ${ingredient.proteins.toFixed(
                      2
                    )} g | Fats: ${ingredient.fats.toFixed(
                      2
                    )} g | Sugars: ${ingredient.sugars.toFixed(2)} g`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>{t("recipes.noIngredients")}</Typography>
          )}
        </SectionCard>
      </PageShell>
    </>
  );
};

export default AddRecipe;
