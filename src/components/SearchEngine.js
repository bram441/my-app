import { useState, useEffect } from "react";
import API from "../api/api";
import "../components/css/toevoegenEten.css";

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

  const filteredFoods = foods.filter((food) => {
    const nameMatch = food.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const tagMatch =
      filterTag.trim() === "" || // If no tag filter, return all foods
      (Array.isArray(food.tags) &&
        food.tags.some((tag) =>
          tag.toLowerCase().trim().includes(filterTag.toLowerCase().trim())
        ));

    return nameMatch && tagMatch;
  });

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
      <h2>resultaten</h2>
      <ul>
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <li
              key={food.id}
              style={{
                cursor: "pointer",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => onSelectFood(food)}
            >
              <strong>{food.name}</strong> - {food.kcal_per_100} kcal/100
              {food.unit}
              <p
                style={{ fontSize: "14px", color: "gray", margin: "5px 0 0 0" }}
              >
                {food.brand ? `Merk: ${food.brand}` : "Merk: Onbekend"}
              </p>
              <p
                style={{ fontSize: "12px", color: "gray", margin: "2px 0 0 0" }}
              >
                {food.tags && food.tags.length > 0
                  ? `Tags: ${food.tags.join(", ")}`
                  : "Geen tags beschikbaar"}
              </p>
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
