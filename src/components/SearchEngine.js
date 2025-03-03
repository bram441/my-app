import { useState, useEffect } from "react";
import API from "../api/api";
import "./css/SearchEngine.css";

const SearchEngine = ({ onSelectFood }) => {
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");

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

  const filteredFoods = foods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.tags.some((tag) =>
        tag.toLowerCase().includes(filterTag.toLowerCase())
      )
  );

  return (
    <div className="searchEngine">
      <h2>Zoek Voedsel</h2>
      <input
        type="text"
        placeholder="Zoek voedsel..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <input
        type="text"
        placeholder="Filter by tag..."
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
      />
      <ul>
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <li
              key={food.id}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectFood(food)}
            >
              {food.name} - {food.kcal_per_100} kcal/100{food.unit}
            </li>
          ))
        ) : (
          <p>Geen resultaten gevonden</p>
        )}
      </ul>
    </div>
  );
};

export default SearchEngine;
