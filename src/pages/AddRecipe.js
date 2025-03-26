import { useState, useEffect } from "react";
import API from "../api/api";
import NavigationBar from "../components/common/NavigationBar";
import "../components/css/addRecipe.css"; // Create this CSS file for styling
import { useNavigate } from "react-router-dom";

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
      setError("Please add at least one ingredient.");
      return;
    }
    try {
      console.log("formData:", formData);
      await API.post("/recipes", formData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding recipe:", error);
      setError("Failed to add recipe.");
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
        name: food?.name || "Unknown Food",
        amount: qty,
        kcal: food ? (food.kcal_per_100 / 100) * qty : 0,
        proteins: food ? (food.proteine_per_100 / 100) * qty : 0,
        fats: food ? (food.fats_per_100 / 100) * qty : 0,
        sugars: food ? (food.sugar_per_100 / 100) * qty : 0,
      };
    }
  );

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <div className="add-recipe-container">
        <h2>Add New Recipe</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="add-recipe-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Recipe Name"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Search Food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="food-quantities">
            {filteredFoods.map((food) => (
              <div key={food.id} className="food-quantity">
                <label>
                  {food.name}
                  <p
                    style={{
                      fontSize: "14px",
                      color: "gray",
                      margin: "5px 0 0 0",
                    }}
                  >
                    {food.kcal_per_100} kcal per 100/{food.unit}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "gray",
                      margin: "5px 0 0 0",
                    }}
                  >
                    {food.portion_description}
                  </p>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Quantity in grams"
                  onChange={(e) =>
                    handleFoodChange(food.id, parseInt(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
          <h3>Recipe Totals:</h3>
          <p>Total Kcal: {parseFloat(formData.total_kcals).toFixed(2)} kcal</p>
          <p>
            Proteins: {parseFloat(formData.total_proteins).toFixed(2)} g | Fats:{" "}
            {parseFloat(formData.total_fats).toFixed(2)} g | Sugars:{" "}
            {parseFloat(formData.total_sugars).toFixed(2)} g
          </p>
          <button type="submit">Add Recipe</button>
        </form>
        <div className="added-ingredients">
          <h3>Added Ingredients:</h3>
          {addedIngredients.length > 0 ? (
            <ul>
              {addedIngredients.map((ingredient) => (
                <li key={ingredient.id}>
                  {ingredient.name} - {ingredient.amount}g -{" "}
                  {ingredient.kcal.toFixed(2)} kcal | Proteins:{" "}
                  {ingredient.proteins.toFixed(2)} g | Fats:{" "}
                  {ingredient.fats.toFixed(2)} g | Sugars:{" "}
                  {ingredient.sugars.toFixed(2)} g
                </li>
              ))}
            </ul>
          ) : (
            <p>No ingredients added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRecipe;
