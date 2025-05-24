import { useState, useEffect } from "react";
import API from "../../api/api";
import "../../components/css/toevoegenEten.css";

const CATEGORIES = [ "fruit",
        "groenten",
        "zuivel",
        "vlees",
        "vis",
        "drinken",
        "brood & granen",
        "maaltijd",
        "smeersels & sauzen",
        "Soep",
        "Bijgerechten",
        "snacks & zoetigheid",
        "vegetarisch",
        "overig"];

const SearchEngine = ({ onSelectFood }) => {
  const [foods, setFoods] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

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
    const fetchBrands = async () => {
      try {
        const response = await API.get("/foods/brands");
        setBrands(response.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  const filteredFoods = foods.filter((food) => {
    const nameMatch = food.name.toLowerCase().includes(searchTerm.toLowerCase());

    const categoryMatch =
      !selectedCategory ||
      (food.main_category &&
        food.main_category.toLowerCase() === selectedCategory.toLowerCase());

    const brandMatch =
      !selectedBrand ||
      (food.brand && food.brand === selectedBrand);

  const tagMatch =
    !filterTag ||
    (Array.isArray(food.tags) &&
      food.tags.some(tag =>
        tag.toLowerCase().includes(filterTag.toLowerCase())
      ));

    return nameMatch && categoryMatch && brandMatch && tagMatch;
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
      <div className="form-group">
                      <label>
          Tags:        </label>
      <input
        type="text"
        placeholder="Filter by tag..."
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
      />
        <label>
          Categorie:        </label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">Alle categorieën</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

        <label>
          Merk:
                  </label>
          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
          >
            <option value="">Alle merken</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

      </div>
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
              <strong>{food.name}</strong> -{"   "}
              {food.kcal_per_100 !== null && food.kcal_per_100 !== undefined
                ? food.kcal_per_100
                : "?"}{" "}
              kcal/100,{"   "}
              {food.proteine_per_100 !== null &&
              food.proteine_per_100 !== undefined
                ? food.proteine_per_100
                : "?"}{" "}
              proteine/100,{"   "}
              {food.fats_per_100 !== null && food.fats_per_100 !== undefined
                ? food.fats_per_100
                : "?"}{" "}
              vet/100,{"   "}
              {food.sugar_per_100 !== null && food.sugar_per_100 !== undefined
                ? food.sugar_per_100
                : "?"}{" "}
              koolhydraten/100 {"   "}
              {food.unit || "?"}
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
