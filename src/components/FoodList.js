import React from "react";

const FoodList = ({ foods }) => {
  return (
    <div className="food-list">
      {foods.length > 0 ? (
        foods.map((food) => (
          <div key={food.id} className="food-item">
            <h3>{food.name}</h3>
            <p> {food.RecipeFood.quantity} gr/ml</p>
          </div>
        ))
      ) : (
        <p>No foods found</p>
      )}
    </div>
  );
};

export default FoodList;
