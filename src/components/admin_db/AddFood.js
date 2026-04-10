import { useEffect, useState } from "react";
import API from "../../api/api";
import Popup from "../common/Popup";
import TextExtractor from "../scanner/TextExtractor"; // Import the TextExtractor component
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AppButton from "../ui/AppButton";

const AddFood = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "ochtend",
    kcal_per_100: "",
    kcal_per_portion: "",
    grams_per_portion: "",
    proteine_per_100: "",
    fats_per_100: "",
    sugar_per_100: "",
    brand: "",
    unit: "gr",
    portion_description: "",
    tags: "",
    main_category: "",
  });
  const [error, setError] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false); // State to toggle popup
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "camera"

  // Automatically calculate Kcal per portion
  useEffect(() => {
    const { kcal_per_100, grams_per_portion } = formData;

    if (kcal_per_100 && grams_per_portion) {
      const kcalPerPortion =
        (parseFloat(kcal_per_100) * parseFloat(grams_per_portion)) / 100;
      setFormData((prevData) => ({
        ...prevData,
        kcal_per_portion: kcalPerPortion.toFixed(1), // Round to 1 decimal place
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.kcal_per_100, formData.grams_per_portion]);

  const handleExtractedText = (data) => {
    setFormData((prev) => ({
      ...prev,
      name: data.product_name || prev.name, // Update product name
      brand: data.brand || prev.brand, // Update brand
      kcal_per_100: data.kcal_per_100 || prev.kcal_per_100,
      proteine_per_100: data.proteine_per_100 || prev.proteine_per_100,
      fats_per_100: data.fats_per_100 || prev.fats_per_100,
      sugar_per_100: data.sugar_per_100 || prev.sugar_per_100,
      grams_per_portion: data.grams_per_portion || prev.grams_per_portion,
      kcal_per_portion: data.kcal_per_portion || prev.kcal_per_portion,
      portion_description: data.portion_description || prev.portion_description, // Update portion description
      tags: data.tags ? data.tags.join(", ") : prev.tags, // Convert tags array to comma-separated string
      main_category: data.main_category || prev.main_category, // Update main category
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const foodData = {
        ...formData,
        kcal_per_100: parseFloat(formData.kcal_per_100),
        kcal_per_portion: parseFloat(formData.kcal_per_portion),
        grams_per_portion: parseFloat(formData.grams_per_portion),
        proteine_per_100: parseFloat(formData.proteine_per_100),
        fats_per_100: parseFloat(formData.fats_per_100),
        sugar_per_100: parseFloat(formData.sugar_per_100),
        tags: formData.tags.split(",").map((tag) => tag.trim()),
        main_category: formData.main_category,
      };

      await API.post("/foods", foodData);
      setFormData({
        name: "",
        type: "ochtend",
        kcal_per_100: "",
        kcal_per_portion: "",
        grams_per_portion: "",
        proteine_per_100: "",
        fats_per_100: "",
        sugar_per_100: "",
        brand: "",
        unit: "gr",
        portion_description: "",
        tags: "",
        main_category: "",
      });
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setError("Dit voedsel bestaat al in de database.");
      } else {
        setError("Failed to add food item.");
      }
    }
  };

  return (
    <Stack sx={{ height: "100%", minHeight: 0 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <AppButton
        sx={{ mb: 1.5, alignSelf: "flex-start", whiteSpace: "nowrap" }}
        onClick={() => setPopupOpen(true)}
      >
        Open Image Scanner
      </AppButton>
      <Stack
        component="form"
        spacing={1.25}
        onSubmit={handleSubmit}
        sx={{ height: "100%", minHeight: 0, overflowY: "auto", pr: 0.5, pb: 0.5 }}
      >
        <TextField
          size="small"
          type="text"
          name="name"
          label="Food Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <FormControl size="small">
          <InputLabel id="food-type-label">Type</InputLabel>
          <Select labelId="food-type-label" label="Type" name="type" value={formData.type} onChange={handleChange}>
            <MenuItem value="ochtend">Ochtend</MenuItem>
            <MenuItem value="middag">Middag</MenuItem>
            <MenuItem value="avond">Avond</MenuItem>
            <MenuItem value="snack">Snack</MenuItem>
            <MenuItem value="drinken">Drinken</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="number"
          step="0.01"
          min="0"
          name="kcal_per_100"
          label="Kcal per 100g/ml"
          value={formData.kcal_per_100}
          onChange={handleChange}
          required
        />
        <TextField
          size="small"
          type="number"
          step="0.01"
          min="0"
          name="grams_per_portion"
          label="Grams per portion"
          value={formData.grams_per_portion}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="number"
          step="0.01"
          min="0"
          name="kcal_per_portion"
          label="Kcal per portion"
          value={formData.kcal_per_portion}
          onChange={handleChange}
          required
        />
        <TextField
          size="small"
          type="number"
          step="0.01"
          min="0"
          name="proteine_per_100"
          label="Proteine per 100g/ml"
          value={formData.proteine_per_100}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="number"
          step="0.01"
          min="0"
          name="fats_per_100"
          label="Fats per 100g/ml"
          value={formData.fats_per_100}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="number"
          step="0.01"
          min="0"
          name="sugar_per_100"
          label="Sugar per 100g/ml"
          value={formData.sugar_per_100}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="text"
          name="brand"
          label="Brand (optional)"
          value={formData.brand}
          onChange={handleChange}
        />
        <FormControl size="small">
          <InputLabel id="food-unit-label">Unit</InputLabel>
          <Select labelId="food-unit-label" label="Unit" name="unit" value={formData.unit} onChange={handleChange}>
            <MenuItem value="gr">Gram (gr)</MenuItem>
            <MenuItem value="ml">Milliliter (ml)</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="text"
          name="portion_description"
          label="Portion Description"
          value={formData.portion_description}
          onChange={handleChange}
        />
        <TextField
          size="small"
          type="text"
          name="tags"
          label="Tags (comma-separated)"
          value={formData.tags}
          onChange={handleChange}
        />
        <FormControl size="small">
          <InputLabel id="main-category-label">Main Category</InputLabel>
          <Select
            labelId="main-category-label"
            label="Main Category"
            name="main_category"
            value={formData.main_category}
            onChange={handleChange}
          >
              <MenuItem value="fruit">Fruit</MenuItem>
              <MenuItem value="groenten">Groenten</MenuItem>
              <MenuItem value="zuivel">Zuivel</MenuItem>
              <MenuItem value="vlees">Vlees</MenuItem>
              <MenuItem value="vis">Vis</MenuItem>
              <MenuItem value="vegetarisch">Vegetarisch</MenuItem>
              <MenuItem value="drinken">Drinken</MenuItem>
              <MenuItem value="brood & granen">Brood & granen</MenuItem>
              <MenuItem value="maaltijd">Maaltijd</MenuItem>
              <MenuItem value="smeersels & sauzen">Smeersels & sauzen</MenuItem>
              <MenuItem value="soep">Soep</MenuItem>
              <MenuItem value="bijgerechten">Bijgerechten</MenuItem>
              <MenuItem value="snacks & zoetigheid">Snacks & zoetigheid</MenuItem>
              <MenuItem value="overig">Overig</MenuItem>
          </Select>
        </FormControl>
        <AppButton
          type="submit"
          sx={{
            mt: 0.5,
            position: "sticky",
            bottom: 0,
            zIndex: 1,
          }}
        >
          Add Food
        </AppButton>
      </Stack>
      {/* Popup for Image Scanning */}
      <Popup
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        size="large"
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Scan Food Information
        </Typography>
        <div>
          <AppButton variant="secondary" onClick={() => setActiveTab("upload")}>
            Upload Picture
          </AppButton>
        </div>
        {activeTab === "upload" && (
          <TextExtractor onExtractedText={handleExtractedText} />
        )}
      </Popup>
    </Stack>
  );
};

export default AddFood;
