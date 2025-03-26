import React from "react";
import "../css/global.css";
import "../css/recipes.css";

const RecipeFoodList = ({ foods }) => {
  return (
    <div className="food-list recipe-food-list">
      {foods.length > 0 ? (
        foods.map((food) => (
          <div key={food.id} className="food-item">
            <div className="food-name">
              <h4>{food.name}</h4>
            </div>
            <div className="food-kcal">{food.RecipeFood.quantity} gr/ml</div>
          </div>
        ))
      ) : (
        <p>No foods found</p>
      )}
    </div>
  );
};

export default RecipeFoodList;
