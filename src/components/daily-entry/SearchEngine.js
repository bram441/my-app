import { useState, useEffect } from "react";
import API from "../../api/api";
import {
  Box,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AppButton from "../ui/AppButton";
import { useLanguage } from "../../context/LanguageContext";

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
  const { t } = useLanguage();
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
        setError(t("search.fetchFailed"));
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, filterTag, selectedCategory, selectedBrand, sortMode, page, t]);

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
      setError(t("search.favoriteToggleFailed"));
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.toLowerCase().includes(brandSearchTerm.toLowerCase())
  );


  return (
    <Box>
      <Stack spacing={1.5}>
        <TextField
          size="small"
          label={t("search.searchFood")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TextField
          size="small"
          label={t("search.filterTag")}
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
        />
        <FormControl size="small">
          <InputLabel id="category-label">{t("search.category")}</InputLabel>
          <Select
            labelId="category-label"
            label={t("search.category")}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">{t("search.allCategories")}</MenuItem>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label={t("search.searchBrand")}
          value={brandSearchTerm}
          onChange={(e) => setBrandSearchTerm(e.target.value)}
        />
        <FormControl size="small">
          <InputLabel id="brand-label">{t("search.brand")}</InputLabel>
          <Select
            labelId="brand-label"
            label={t("search.brand")}
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <MenuItem value="">{t("search.allBrands")}</MenuItem>
            {filteredBrands.map((brand) => (
              <MenuItem key={brand} value={brand}>
                {brand}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel id="sort-label">{t("search.sorting")}</InputLabel>
          <Select
            labelId="sort-label"
            label={t("search.sorting")}
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
          >
            <MenuItem value="name">{t("search.nameAz")}</MenuItem>
            <MenuItem value="favorites">{t("search.onlyFavorites")}</MenuItem>
            <MenuItem value="frequent">{t("search.mostChosen")}</MenuItem>
            <MenuItem value="recent">{t("search.recentlyChosen")}</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Typography variant="subtitle2" sx={{ mt: 2, color: "text.secondary" }}>
        {t("search.results")}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {loading && <Typography>{t("search.loading")}</Typography>}
      {!error && (
        <Typography sx={{ fontSize: 13, color: "text.secondary", my: 1 }}>
          {totalItems} {t("search.resultStats")} {page} {t("search.of")} {totalPages}
        </Typography>
      )}
      <List sx={{ maxHeight: 460, overflowY: "auto", borderRadius: 2 }}>
        {foods.length > 0 ? (
          foods.map((food) => (
            <ListItemButton
              key={food.id}
              divider
              alignItems="flex-start"
              onClick={() => onSelectFood(food)}
            >
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography fontWeight={700}>{food.name}</Typography>
                    <AppButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(food);
                  }}
                      variant="ghost"
                      sx={{ minWidth: 40, p: 0.5 }}
                      title={t("search.toggleFavorite")}
                    >
                      {food.is_favorite ? "★" : "☆"}
                    </AppButton>
                  </Box>
                }
                secondary={
                  <>
                    {food.kcal_per_100 !== null && food.kcal_per_100 !== undefined
                      ? food.kcal_per_100
                      : "?"}{" "}
                    kcal/100,{" "}
                    {food.proteine_per_100 !== null &&
                    food.proteine_per_100 !== undefined
                      ? food.proteine_per_100
                      : "?"}{" "}
                    {t("search.proteinShort")}/100,{" "}
                    {food.fats_per_100 !== null && food.fats_per_100 !== undefined
                      ? food.fats_per_100
                      : "?"}{" "}
                    {t("search.fatShort")}/100,{" "}
                    {food.sugar_per_100 !== null && food.sugar_per_100 !== undefined
                      ? food.sugar_per_100
                      : "?"}{" "}
                    {t("search.carbsShort")}/100 {food.unit || "?"}
                    <Typography
                      component="div"
                      sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}
                    >
                      {food.brand ? `${t("search.brandPrefix")}: ${food.brand}` : `${t("search.brandPrefix")}: ${t("search.unknownBrand")}`}
                    </Typography>
                    <Typography
                      component="div"
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    >
                      {food.tags && food.tags.length > 0
                        ? `${t("search.tagsPrefix")}: ${food.tags.join(", ")}`
                        : t("search.noTags")}
                    </Typography>
                    <Typography
                      component="div"
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    >
                      {t("search.chosenCount")}: {food.selection_count || 0} {t("search.times")}
                    </Typography>
                  </>
                }
              />
            </ListItemButton>
          ))
        ) : (
          !loading && <Typography>{t("search.noResults")}</Typography>
        )}
      </List>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
        <AppButton
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          disabled={page <= 1 || loading}
          variant="secondary"
        >
          {t("search.previous")}
        </AppButton>
        <Typography sx={{ minWidth: 80 }}>{t("search.page")} {page}</Typography>
        <AppButton
          onClick={() => setPage((current) => current + 1)}
          disabled={!hasNextPage || loading}
          variant="secondary"
        >
          {t("search.next")}
        </AppButton>
      </Stack>
    </Box>
  );
};

export default SearchEngine;
