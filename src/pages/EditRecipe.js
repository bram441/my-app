import { useState, useEffect } from "react";
import API from "../api/api";
import NavigationBar from "../components/common/NavigationBar";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import PageShell from "../components/ui/PageShell";
import SectionCard from "../components/ui/SectionCard";
import AppButton from "../components/ui/AppButton";

const EditRecipe = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    food_quantities: [], // Updated to handle an array of food objects
    total_kcals: 0,
    total_proteins: 0,
    total_fats: 0,
    total_sugars: 0,
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await API.get(`/recipes/recipeId/${id}`);
        const recipe = response.data;
        setFormData({
          name: recipe.name,
          food_quantities: recipe.foods,
          total_kcals: recipe.total_kcals,
          total_proteins: recipe.total_proteins,
          total_fats: recipe.total_fats,
          total_sugars: recipe.total_sugars,
        });
        console.log("formData", formData);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };

    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFoodChange = (foodId, quantity) => {
    setFormData((prevData) => {
      const updatedFoodQuantities = prevData.food_quantities.map((food) => {
        if (food.id === parseInt(foodId)) {
          return {
            ...food,
            RecipeFood: {
              ...food.RecipeFood,
              quantity: quantity,
            },
          };
        }
        return food;
      });

      const totalKcals = updatedFoodQuantities.reduce((total, food) => {
        return total + (food.RecipeFood.quantity * food.kcal_per_100) / 100;
      }, 0);

      const totalProteins = updatedFoodQuantities.reduce((total, food) => {
        return total + (food.RecipeFood.quantity * food.proteine_per_100) / 100;
      }, 0);

      const totalFats = updatedFoodQuantities.reduce((total, food) => {
        return total + (food.RecipeFood.quantity * food.fats_per_100) / 100;
      }, 0);

      const totalSugars = updatedFoodQuantities.reduce((total, food) => {
        return total + (food.RecipeFood.quantity * food.sugar_per_100) / 100;
      }, 0);

      return {
        ...prevData,
        food_quantities: updatedFoodQuantities,
        total_kcals: totalKcals,
        total_proteins: totalProteins,
        total_fats: totalFats,
        total_sugars: totalSugars,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedRecipe = {
        name: formData.name,
        food_quantities: formData.food_quantities.map((food) => ({
          food_id: food.id,
          quantity: food.RecipeFood.quantity,
        })),
        total_kcals: formData.total_kcals,
        total_proteins: formData.total_proteins,
        total_fats: formData.total_fats,
        total_sugars: formData.total_sugars,
      };

      await API.put(`/recipes/${id}`, updatedRecipe);
      navigate("/recipes");
    } catch (error) {
      console.error("Error updating recipe:", error);
      setError("Failed to update recipe.");
    }
  };

  return (
    <>
      <header>
        <NavigationBar />
      </header>
      <PageShell>
        <SectionCard title="Edit Recipe">
          {error && <Alert severity="error">{error}</Alert>}
          <Stack component="form" spacing={1.5} onSubmit={handleSubmit}>
            <TextField
            size="small"
            type="text"
            name="name"
            label="Recipe Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
            <Typography variant="subtitle2">Food Quantities in grams</Typography>
            <Box sx={{ maxHeight: 360, overflowY: "auto", pr: 0.5 }}>
            {formData.food_quantities.map((food) => (
                <Box key={food.id} sx={{ mb: 1.25, p: 1, borderRadius: 2, bgcolor: "rgba(15,23,42,0.03)" }}>
                  <Typography fontWeight={700}>{food.name || "Unknown Food"}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {food.kcal_per_100}kcal per 100/gr
                  </Typography>
                  <TextField
                  size="small"
                  sx={{ mt: 1 }}
                  type="number"
                  min="0"
                  label="Quantity"
                  value={food.RecipeFood.quantity}
                  onChange={(e) =>
                    handleFoodChange(food.id, parseInt(e.target.value))
                  }
                />
                </Box>
            ))}
            </Box>
            <Typography variant="h6">Recipe Totals</Typography>
            <Typography>Total Kcal: {parseFloat(formData.total_kcals).toFixed(2)} kcal</Typography>
            <Typography>
            Proteins: {parseFloat(formData.total_proteins).toFixed(2)} g | Fats:{" "}
            {parseFloat(formData.total_fats).toFixed(2)} g | Sugars:{" "}
            {parseFloat(formData.total_sugars).toFixed(2)} g
            </Typography>
            <AppButton type="submit">Update Recipe</AppButton>
          </Stack>
        </SectionCard>
      </PageShell>
    </>
  );
};

export default EditRecipe;
