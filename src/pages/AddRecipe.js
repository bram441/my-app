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
      const newFoodQuantities = {
        ...prevData.food_quantities,
        [foodId]: quantity,
      };

      const totalKcals = Object.entries(newFoodQuantities).reduce(
        (total, [id, qty]) => {
          const food = foods.find((food) => food.id === parseInt(id));
          return total + (food ? (food.kcal_per_100 / 100) * qty : 0);
        },
        0
      );

      return {
        ...prevData,
        food_quantities: newFoodQuantities,
        total_kcals: totalKcals,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
                    {food.kcal_per_100}kcal per 100/{food.unit}
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
          <h3>Recipe Total Kcal: </h3>
          <input
            type="number"
            name="total_kcals"
            placeholder="Total Kcal"
            value={parseFloat(formData.total_kcals).toFixed(2)}
            readOnly
          />
          <button type="submit">Add Recipe</button>
        </form>
        <div className="added-ingredients">
          <h3>Added Ingredients:</h3>
          {addedIngredients.length > 0 ? (
            <ul>
              {addedIngredients.map((ingredient) => (
                <li key={ingredient.id}>
                  {ingredient.name} - {ingredient.amount}g -{" "}
                  {ingredient.kcal.toFixed(2)} kcal
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
