import { useState, useEffect } from "react";
import API from "../../api/api";
import "../css/databaseManagement.css";

const FoodManagement = ({ searchTerm }) => {
  const [foods, setFoods] = useState([]);
  const [editingFood, setEditingFood] = useState(null);
  const [error, setError] = useState(null);

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
      await API.delete(`/foods/${foodId}`);
      setFoods((prevFoods) => prevFoods.filter((food) => food.id !== foodId));
    } catch (error) {
      console.error("Error deleting food:", error);
      setError("Failed to delete food.");
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
  const [formData, setFormData] = useState(food);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-food-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="kcal_per_100">Kcal per 100</label>
        <input
          type="number"
          name="kcal_per_100"
          value={formData.kcal_per_100}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="portion_description">Portion description</label>
        <input
          type="text"
          name="portion_description"
          value={formData.portion_description}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="tags">Tags</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="brand">Brand</label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="kcal_per_portion">Kcal per portion</label>
        <input
          type="number"
          name="kcal_per_portion"
          value={formData.kcal_per_portion}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="unit">Unit</label>
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
