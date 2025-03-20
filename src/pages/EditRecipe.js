import { useState, useEffect } from "react";
import API from "../api/api";
import NavigationBar from "../components/common/NavigationBar";
import "../components/css/addRecipe.css"; // Reuse the same CSS as AddRecipe
import { useParams, useNavigate } from "react-router-dom";

const EditRecipe = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    food_quantities: [], // Updated to handle an array of food objects
    total_kcals: 0,
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
        });
        console.log("formData", formData);
      } catch (error) {
        console.error("Error fetching recipe:", error);
      }
    };

    fetchRecipe();
  }, [id, formData]);

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

      return {
        ...prevData,
        food_quantities: updatedFoodQuantities,
        total_kcals: totalKcals,
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
      };

      await API.put(`/recipes/${id}`, updatedRecipe);
      navigate("/recipes");
    } catch (error) {
      console.error("Error updating recipe:", error);
      setError("Failed to update recipe.");
    }
  };

  return (
    <div>
      <header>
        <NavigationBar />
      </header>
      <div className="add-recipe-container">
        <h2>Edit Recipe</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="add-recipe-form" onSubmit={handleSubmit}>
          <label
            htmlFor="name"
            style={{
              fontSize: "16px",
              margin: "10px 0",
            }}
          >
            Recipe Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Recipe Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <label
            style={{
              fontSize: "16px",
              margin: "10px 0",
            }}
          >
            Food Quantities in grams
          </label>
          <div className="food-quantities">
            {formData.food_quantities.map((food) => (
              <div key={food.id} className="food-quantity">
                <label>
                  {food.name || "Unknown Food"}
                  <p
                    style={{
                      fontSize: "14px",
                      color: "gray",
                      margin: "5px 0 0 0",
                    }}
                  >
                    {food.kcal_per_100}kcal per 100/gr
                  </p>
                </label>
                <input
                  type="number"
                  min="0"
                  value={food.RecipeFood.quantity}
                  onChange={(e) =>
                    handleFoodChange(food.id, parseInt(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
          <h3>Recipe Total Kcal: {formData.total_kcals.toFixed(2)}</h3>
          <button type="submit">Update Recipe</button>
        </form>
      </div>
    </div>
  );
};

export default EditRecipe;
