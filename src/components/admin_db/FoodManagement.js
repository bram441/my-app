import { useState, useEffect } from "react";
import API from "../../api/api";
import "../css/databaseManagement.css";
import "../css/global.css";
import Popup from "../common/Popup";

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
      {error && <p className="error-message">{error}</p>}
      <ul className="food-list">
        {filteredFoods.map((food) => (
          <li key={food.id} className="food-item">
            <div className="food-name">{food.name}</div>
            <div className="food-nutrients">
              Proteins: {parseFloat(food.proteine_per_100).toFixed(2)} g | Fats:{" "}
              {parseFloat(food.fats_per_100).toFixed(2)} g | Sugars:{" "}
              {parseFloat(food.sugar_per_100).toFixed(2)} g
            </div>
            <div className="food-kcal">
              {food.kcal_per_100} kcal/100 {food.unit}
            </div>
            <div className="food-actions">
              <button className="edit-button" onClick={() => handleEdit(food)}>
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(food.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {deletePopup.isOpen && (
        <Popup isOpen={deletePopup.isOpen} onClose={() => setDeletePopup({ isOpen: false, food: null, recipes: [], dailyEntries: [] })}>
          <h2>Warning: Food is being used</h2>
          <p>The food <strong>{deletePopup.food.name}</strong> is being used in the following:</p>
          <h3>Recipes:</h3>
          <ul>
            {deletePopup.recipes.map((recipe) => (
              <li key={recipe.id}>{recipe.name}</li>
            ))}
          </ul>
          <h3>Daily Entries:</h3>
          <ul>
            {deletePopup.dailyEntries.map((entry) => (
              <li key={entry.id}>
                Date: {entry.date}, Calories: {entry.total_kcal}
              </li>
            ))}
          </ul>
          <p>Are you sure you want to delete this food? This will also delete the related recipes and daily entries.</p>
          <button className="delete-button-confirm" onClick={() => handleForceDelete(deletePopup.food.id)}>
            Yes, Delete
          </button>
          <button className="delete-button-deny" onClick={() => setDeletePopup({ isOpen: false, food: null, recipes: [], dailyEntries: [] })}>
            Cancel
          </button>
        </Popup>
      )}

      {editingFood && (
        <EditFoodForm
          food={editingFood}
          onUpdate={handleUpdate}
          onCancel={() => setEditingFood(null)}
        />
      )}
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
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">
          <strong>Name</strong>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="kcal_per_100">
          <strong>Kcal per 100</strong>
        </label>
        <input
          type="number"
          name="kcal_per_100"
          value={formData.kcal_per_100}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="kcal_per_portion">
          <strong>Kcal per portion</strong>
        </label>
        <input
          type="number"
          name="kcal_per_portion"
          value={formData.kcal_per_portion}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="grams_per_portion">
          <strong>Grams per portion</strong>
        </label>
        <input
          type="number"
          name="grams_per_portion"
          value={formData.grams_per_portion}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="proteine_per_100">
          <strong>Proteine per 100</strong>
        </label>
        <input
          type="number"
          name="proteine_per_100"
          value={formData.proteine_per_100}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="fats_per_100">
          <strong>Fats per 100</strong>
        </label>
        <input
          type="number"
          name="fats_per_100"
          value={formData.fats_per_100}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="sugar_per_100">
          <strong>Sugar per 100</strong>
        </label>
        <input
          type="number"
          name="sugar_per_100"
          value={formData.sugar_per_100}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="portion_description">
          <strong>Portion description</strong>
        </label>
        <input
          type="text"
          name="portion_description"
          value={formData.portion_description}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="tags">
          <strong>Tags</strong>
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="brand">
          <strong>Brand</strong>
        </label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="unit">
          <strong>Unit</strong>
        </label>
        <select
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          required
        >
          <option value="gr">Gram (gr)</option>
          <option value="ml">Milliliter (ml)</option>
        </select>
      </div>
            <div className="form-group">
        <label htmlFor="main_category">
          <strong>Main Category</strong>
        </label>
        <select
          name="main_category"
          value={formData.main_category}
          onChange={handleChange}
          required
        >
          <option value="fruit">Fruit</option>
          <option value="groenten">Groenten</option>
          <option value="zuivel">Zuivel</option>
          <option value="vlees">Vlees</option>
          <option value="vis">Vis</option>
          <option value="vegetarisch">Vegetarisch</option>
          <option value="drinken">Drinken</option>
          <option value="brood & granen">Brood & granen</option>
          <option value="maaltijd">Maaltijd</option>
          <option value="smeersels & sauzen">Smeersels & sauzen</option>
          <option value="soep">Soep</option>
          <option value="bijgerechten">Bijgerechten</option>
          <option value="snacks & zoetigheid">Snacks & zoetigheid</option>
          <option value="overig">Overig</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default FoodManagement;
