import { useState, useEffect } from "react";
import API from "../../api/api";
import Popup from "../common/Popup";
import {
  Alert,
  FormControl,
  InputLabel,
  Box,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AppButton from "../ui/AppButton";

const FoodManagement = ({ searchTerm }) => {
  const [foods, setFoods] = useState([]);
  const [editingFood, setEditingFood] = useState(null);
  const [error, setError] = useState(null);
  const [deletePopup, setDeletePopup] = useState({ isOpen: false, food: null, recipes: [], dailyEntries: [] });


  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await API.get("/foods");
        setFoods(response.data);
      } catch (error) {
        console.error("Error fetching foods:", error);
        setError("Failed to fetch foods.");
      }
    };
    fetchFoods();
  }, []);

  const handleDelete = async (foodId) => {
    try {
      const response = await API.delete(`/foods/${foodId}`);
      if (response.data.message === "Food is being used") {
        setDeletePopup({
          isOpen: true,
          food: foods.find((food) => food.id === foodId),
          recipes: response.data.recipes,
          dailyEntries: response.data.dailyEntries,
        });
      } else {
        setFoods((prevFoods) => prevFoods.filter((food) => food.id !== foodId));
      }
    } catch (error) {
      console.error("Error deleting food:", error);
      setError("Failed to delete food.");
    }
  };

  const handleForceDelete = async (foodId) => {
    try {
      await API.delete(`/foods/${foodId}/force`);
      setFoods((prevFoods) => prevFoods.filter((food) => food.id !== foodId));
      setDeletePopup({ isOpen: false, food: null, recipes: [], dailyEntries: [] });
    } catch (error) {
      console.error("Error force deleting food:", error);
      setError("Failed to force delete food.");
    }
  };

  
  const handleEdit = (food) => {
    setEditingFood(food);
  };

  const handleUpdate = async (updatedFood) => {
    try {
      const response = await API.put(`/foods/${updatedFood.id}`, updatedFood);
      setFoods((prevFoods) =>
        prevFoods.map((food) =>
          food.id === updatedFood.id ? response.data : food
        )
      );
      setEditingFood(null);
    } catch (error) {
      console.error("Error updating food:", error);
      setError("Failed to update food.");
    }
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ maxHeight: "62vh", overflowY: "auto", pr: 0.5 }}>
      <List>
        {filteredFoods.map((food) => (
          <ListItem key={food.id} divider>
            <ListItemText
              primary={food.name}
              secondary={`Proteins: ${parseFloat(food.proteine_per_100).toFixed(
                2
              )} g | Fats: ${parseFloat(food.fats_per_100).toFixed(
                2
              )} g | Sugars: ${parseFloat(food.sugar_per_100).toFixed(
                2
              )} g | ${food.kcal_per_100} kcal/100 ${food.unit}`}
            />
            <Stack direction="row" spacing={1}>
              <AppButton variant="secondary" onClick={() => handleEdit(food)}>
                Edit
              </AppButton>
              <AppButton variant="danger" onClick={() => handleDelete(food.id)}>
                Delete
              </AppButton>
            </Stack>
          </ListItem>
        ))}
      </List>
      </Box>
      {deletePopup.isOpen && (
        <Popup isOpen={deletePopup.isOpen} onClose={() => setDeletePopup({ isOpen: false, food: null, recipes: [], dailyEntries: [] })}>
          <Typography variant="h6">Warning: Food is being used</Typography>
          <Typography sx={{ mt: 1 }}>The food <strong>{deletePopup.food.name}</strong> is being used in the following:</Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Recipes:</Typography>
          <List>
            {deletePopup.recipes.map((recipe) => (
              <ListItem key={recipe.id}><ListItemText primary={recipe.name} /></ListItem>
            ))}
          </List>
          <Typography variant="subtitle1">Daily Entries:</Typography>
          <List>
            {deletePopup.dailyEntries.map((entry) => (
              <ListItem key={entry.id}>
                <ListItemText primary={`Date: ${entry.date}, Calories: ${entry.total_kcal}`} />
              </ListItem>
            ))}
          </List>
          <Typography sx={{ mb: 1 }}>Are you sure you want to delete this food? This will also delete the related recipes and daily entries.</Typography>
          <AppButton variant="danger" onClick={() => handleForceDelete(deletePopup.food.id)}>
            Yes, Delete
          </AppButton>
          <AppButton variant="secondary" sx={{ ml: 1 }} onClick={() => setDeletePopup({ isOpen: false, food: null, recipes: [], dailyEntries: [] })}>
            Cancel
          </AppButton>
        </Popup>
      )}

      <Popup isOpen={Boolean(editingFood)} onClose={() => setEditingFood(null)}>
        {editingFood ? (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Edit Food: {editingFood.name}
            </Typography>
            <EditFoodForm
              food={editingFood}
              onUpdate={handleUpdate}
              onCancel={() => setEditingFood(null)}
            />
          </>
        ) : null}
      </Popup>
    </div>
  );
};

const EditFoodForm = ({ food, onUpdate, onCancel }) => {
  // Convert tags array to a comma-separated string for the input field
  const [formData, setFormData] = useState({
    ...food,
    tags: Array.isArray(food.tags) ? food.tags.join(", ") : "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      kcal_per_100: parseFloat(formData.kcal_per_100),
      kcal_per_portion: parseFloat(formData.kcal_per_portion),
      grams_per_portion: parseFloat(formData.grams_per_portion),
      proteine_per_100: parseFloat(formData.proteine_per_100),
      fats_per_100: parseFloat(formData.fats_per_100),
      sugar_per_100: parseFloat(formData.sugar_per_100),
      main_category: formData.main_category,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
    });
  };

  return (
    <Stack component="form" spacing={1} onSubmit={handleSubmit} sx={{ mt: 1.5 }}>
        <TextField
          size="small"
          type="text"
          name="name"
          label="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <TextField
          size="small"
          type="number"
          name="kcal_per_100"
          label="Kcal per 100"
          value={formData.kcal_per_100}
          onChange={handleChange}
          required
        />
        <TextField
          size="small"
          type="number"
          name="kcal_per_portion"
          label="Kcal per portion"
          value={formData.kcal_per_portion}
          onChange={handleChange}
          required
        />
        <TextField
          size="small"
          type="number"
          name="grams_per_portion"
          label="Grams per portion"
          value={formData.grams_per_portion}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="number"
          name="proteine_per_100"
          label="Proteine per 100"
          value={formData.proteine_per_100}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="number"
          name="fats_per_100"
          label="Fats per 100"
          value={formData.fats_per_100}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="number"
          name="sugar_per_100"
          label="Sugar per 100"
          value={formData.sugar_per_100}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="text"
          name="portion_description"
          label="Portion description"
          value={formData.portion_description}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="text"
          name="tags"
          label="Tags"
          value={formData.tags}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="text"
          name="brand"
          label="Brand"
          value={formData.brand}
          onChange={handleChange}
        />
        <FormControl size="small">
          <InputLabel id="unit-label">Unit</InputLabel>
          <Select
          labelId="unit-label"
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          required
        >
            <MenuItem value="gr">Gram (gr)</MenuItem>
            <MenuItem value="ml">Milliliter (ml)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel id="main-category-label">Main Category</InputLabel>
          <Select
          labelId="main-category-label"
          label="Main Category"
          name="main_category"
          value={formData.main_category}
          onChange={handleChange}
          required
        >
            <MenuItem value="fruit">Fruit</MenuItem>
            <MenuItem value="groenten">Groenten</MenuItem>
            <MenuItem value="zuivel">Zuivel</MenuItem>
            <MenuItem value="vlees">Vlees</MenuItem>
            <MenuItem value="vis">Vis</MenuItem>
            <MenuItem value="vegetarisch">Vegetarisch</MenuItem>
            <MenuItem value="drinken">Drinken</MenuItem>
            <MenuItem value="brood & granen">Brood & granen</MenuItem>
            <MenuItem value="maaltijd">Maaltijd</MenuItem>
            <MenuItem value="smeersels & sauzen">Smeersels & sauzen</MenuItem>
            <MenuItem value="soep">Soep</MenuItem>
            <MenuItem value="bijgerechten">Bijgerechten</MenuItem>
            <MenuItem value="snacks & zoetigheid">Snacks & zoetigheid</MenuItem>
            <MenuItem value="overig">Overig</MenuItem>
          </Select>
        </FormControl>
      <Stack direction="row" spacing={1}>
        <AppButton type="submit">Save</AppButton>
        <AppButton type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </AppButton>
      </Stack>
    </Stack>
  );
};

export default FoodManagement;
