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
  const [sortMode, setSortMode] = useState("name");
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  const PAGE_SIZE = 25;

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

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const response = await API.get("/foods/search", {
          params: {
            q: searchTerm,
            tag: filterTag,
            category: selectedCategory,
            brand: selectedBrand,
            sort_mode: sortMode,
            page,
            limit: PAGE_SIZE,
          },
        });
        setFoods(response.data.items || []);
        const pagination = response.data.pagination || {};
        setHasNextPage(Boolean(pagination.hasNextPage));
        setTotalItems(pagination.totalItems || 0);
        setTotalPages(pagination.totalPages || 1);
      } catch (fetchError) {
        console.error("Error fetching foods:", fetchError);
        setFoods([]);
        setHasNextPage(false);
        setTotalItems(0);
        setTotalPages(1);
        setError("Kon voedselresultaten niet ophalen.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, filterTag, selectedCategory, selectedBrand, sortMode, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterTag, selectedCategory, selectedBrand, sortMode]);

  const toggleFavorite = async (food) => {
    try {
      const response = await API.post(`/foods/${food.id}/favorite`, {
        is_favorite: !food.is_favorite,
      });

      const nextFavoriteState = response.data.is_favorite;

      setFoods((currentFoods) => {
        if (sortMode === "favorites" && !nextFavoriteState) {
          return currentFoods.filter((item) => item.id !== food.id);
        }

        return currentFoods.map((item) =>
          item.id === food.id ? { ...item, is_favorite: nextFavoriteState } : item
        );
      });

      setTotalItems((current) => {
        if (sortMode === "favorites" && !nextFavoriteState) {
          return Math.max(0, current - 1);
        }
        return current;
      });
    } catch (favoriteError) {
      console.error("Error toggling favorite:", favoriteError);
      setError("Favoriet aanpassen is mislukt.");
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.toLowerCase().includes(brandSearchTerm.toLowerCase())
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
        <input
          type="text"
          placeholder="Zoek merk..."
          value={brandSearchTerm}
          onChange={(e) => setBrandSearchTerm(e.target.value)}
        />
          <select
            value={selectedBrand}
            onChange={e => setSelectedBrand(e.target.value)}
          >
            <option value="">Alle merken</option>
            {filteredBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        <label>Sortering:</label>
        <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
          <option value="name">Naam (A-Z)</option>
          <option value="favorites">Alleen favorieten</option>
          <option value="frequent">Meest gekozen</option>
          <option value="recent">Recent gekozen</option>
        </select>

      </div>
      <h2>resultaten</h2>
      {error && <p className="error">{error}</p>}
      {loading && <p>Laden...</p>}
      {!error && (
        <p style={{ fontSize: "13px", color: "gray", margin: "6px 0 10px 0" }}>
          {totalItems} resultaten - pagina {page} van {totalPages}
        </p>
      )}
      <ul>
        {foods.length > 0 ? (
          foods.map((food) => (
            <li
              key={food.id}
              style={{
                cursor: "pointer",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
              onClick={() => onSelectFood(food)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{food.name}</strong>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(food);
                  }}
                  style={{ minWidth: 40 }}
                  title="Toggle favoriet"
                >
                  {food.is_favorite ? "★" : "☆"}
                </button>
              </div>
              {" - "}
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
              <p style={{ fontSize: "12px", color: "gray", margin: "2px 0 0 0" }}>
                Gekozen: {food.selection_count || 0} keer
              </p>
            </li>
          ))
        ) : (
          !loading && <p>Geen resultaten gevonden</p>
        )}
      </ul>
      <div className="food-actions" style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          disabled={page <= 1 || loading}
        >
          Vorige
        </button>
        <span>Pagina {page}</span>
        <button
          onClick={() => setPage((current) => current + 1)}
          disabled={!hasNextPage || loading}
        >
          Volgende
        </button>
      </div>
    </div>
  );
};

export default SearchEngine;
