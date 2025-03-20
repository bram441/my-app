import { useState } from "react";
import API from "../../api/api";
import "../css/databaseManagement.css";
import "../css/addFood.css";

const AddFood = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "ochtend",
    kcal_per_100: "",
    kcal_per_portion: "",
    brand: "",
    unit: "gr",
    portion_description: "",
    tags: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const foodData = {
        ...formData,
        kcal_per_100: parseFloat(formData.kcal_per_100),
        kcal_per_portion: parseFloat(formData.kcal_per_portion),
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      };

      await API.post("/foods", foodData);
      setFormData({
        name: "",
        type: "ochtend",
        kcal_per_100: "",
        kcal_per_portion: "",
        brand: "",
        unit: "gr",
        portion_description: "",
        tags: "",
      });
    } catch (error) {
      console.error("Error adding food:", error);
      setError("Failed to add food item.");
    }
  };

  return (
    <div className="add-food-container">
      {error && <p className="error-message">{error}</p>}
      <form className="add-food-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Food Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="ochtend">Ochtend</option>
          <option value="middag">Middag</option>
          <option value="avond">Avond</option>
          <option value="snack">Snack</option>
          <option value="drinken">Drinken</option>
        </select>
        <input
          type="number"
          step="0.1"
          min="0.1"
          name="kcal_per_100"
          placeholder="Kcal per 100g/ml"
          value={formData.kcal_per_100}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          step="0.1"
          min="0.1"
          name="kcal_per_portion"
          placeholder="Kcal per portion"
          value={formData.kcal_per_portion}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="brand"
          placeholder="Brand (optional)"
          value={formData.brand}
          onChange={handleChange}
        />
        <select name="unit" value={formData.unit} onChange={handleChange}>
          <option value="gr">Gram (gr)</option>
          <option value="ml">Milliliter (ml)</option>
        </select>
        <input
          type="text"
          name="portion_description"
          placeholder="Portion Description (e.g., 1 slice, 1 bottle)"
          value={formData.portion_description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma-separated)"
          value={formData.tags}
          onChange={handleChange}
        />
        <button type="submit">Add Food</button>
      </form>
    </div>
  );
};

export default AddFood;
