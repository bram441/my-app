import React from "react";
import "../css/global.css";

const RecipeFoodList = ({ foods }) => {
  return (
    <div className="food-list">
      {foods.length > 0 ? (
        foods.map((food) => (
          <div key={food.id} className="food-item">
            <div className="food-name">
              <h3>{food.name}</h3>
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
