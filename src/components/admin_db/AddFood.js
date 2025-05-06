import { useEffect, useState } from "react";
import API from "../../api/api";
import Fuse from "fuse.js";
import Popup from "../common/Popup";
import TextExtractor from "../scanner/TextExtractor"; // Import the TextExtractor component
import "../css/databaseManagement.css";
import "../css/addFood.css";
import "../css/global.css";

const AddFood = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "ochtend",
    kcal_per_100: "",
    kcal_per_portion: "",
    grams_per_portion: "",
    proteine_per_100: "",
    fats_per_100: "",
    sugar_per_100: "",
    brand: "",
    unit: "gr",
    portion_description: "",
    tags: "",
  });
  const [error, setError] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false); // State to toggle popup
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "camera"

  // Automatically calculate Kcal per portion
  useEffect(() => {
    const { kcal_per_100, grams_per_portion } = formData;

    if (kcal_per_100 && grams_per_portion) {
      const kcalPerPortion =
        (parseFloat(kcal_per_100) * parseFloat(grams_per_portion)) / 100;
      setFormData((prevData) => ({
        ...prevData,
        kcal_per_portion: kcalPerPortion.toFixed(1), // Round to 1 decimal place
      }));
    }
  }, [formData.kcal_per_100, formData.grams_per_portion]);

  const handleExtractedText = (data) => {
    setFormData((prev) => ({
      ...prev,
      name: data.product_name || prev.name, // Update product name
      brand: data.brand || prev.brand, // Update brand
      kcal_per_100: data.kcal_per_100 || prev.kcal_per_100,
      proteine_per_100: data.proteine_per_100 || prev.proteine_per_100,
      fats_per_100: data.fats_per_100 || prev.fats_per_100,
      sugar_per_100: data.sugar_per_100 || prev.sugar_per_100,
      grams_per_portion: data.grams_per_portion || prev.grams_per_portion,
      kcal_per_portion: data.kcal_per_portion || prev.kcal_per_portion,
      portion_description: data.portion_description || prev.portion_description, // Update portion description
      tags: data.tags ? data.tags.join(", ") : prev.tags, // Convert tags array to comma-separated string
    }));
  };

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
        grams_per_portion: parseFloat(formData.grams_per_portion),
        proteine_per_100: parseFloat(formData.proteine_per_100),
        fats_per_100: parseFloat(formData.fats_per_100),
        sugar_per_100: parseFloat(formData.sugar_per_100),
        tags: formData.tags.split(",").map((tag) => tag.trim()),
      };

      await API.post("/foods", foodData);
      setFormData({
        name: "",
        type: "ochtend",
        kcal_per_100: "",
        kcal_per_portion: "",
        grams_per_portion: "",
        proteine_per_100: "",
        fats_per_100: "",
        sugar_per_100: "",
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
      <h2>Add Food Item</h2>
      <button onClick={() => setPopupOpen(true)}>Open Image Scanner</button>
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
          min="0"
          name="kcal_per_100"
          placeholder="Kcal per 100g/ml"
          value={formData.kcal_per_100}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          step="0.1"
          min="0"
          name="grams_per_portion"
          placeholder="Grams per portion"
          value={formData.grams_per_portion}
          onChange={handleChange}
        />
        <input
          type="number"
          step="0.1"
          min="0"
          name="kcal_per_portion"
          placeholder="Kcal per portion"
          value={formData.kcal_per_portion}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          step="0.1"
          min="0"
          name="proteine_per_100"
          placeholder="Proteine per 100g/ml"
          value={formData.proteine_per_100}
          onChange={handleChange}
        />
        <input
          type="number"
          step="0.1"
          min="0"
          name="fats_per_100"
          placeholder="Fats per 100g/ml"
          value={formData.fats_per_100}
          onChange={handleChange}
        />
        <input
          type="number"
          step="0.1"
          min="0"
          name="sugar_per_100"
          placeholder="Sugar per 100g/ml"
          value={formData.sugar_per_100}
          onChange={handleChange}
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
      {/* Popup for Image Scanning */}
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        size="large"
      >
        <h2>Scan Food Information</h2>
        <div className="tab-buttons">
          <button className="active" onClick={() => setActiveTab("upload")}>
            Upload Picture
          </button>
        </div>
        {activeTab === "upload" && (
          <TextExtractor onExtractedText={handleExtractedText} />
        )}
      </Popup>
    </div>
  );
};

export default AddFood;
