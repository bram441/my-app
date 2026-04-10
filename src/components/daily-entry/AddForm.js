import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/api";
import DatePicker from "react-datepicker"; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker CSS
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AppButton from "../ui/AppButton";

const AddForm = ({ selectedFood, setSelectedFood }) => {
  const { selectedDate, setSelectedDate } = useContext(AuthContext);
  const [portionType, setPortionType] = useState("portion"); // "custom" or "portion"
  const [portionSize, setPortionSize] = useState(""); // Custom input (grams/ml)
  const [portionCount, setPortionCount] = useState(""); // Portion selection
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFood) {
      setError("Selecteer voedsel.");
      return;
    }

    if (
      (portionCount === 0 && portionType === "portion") ||
      (portionSize === 0 && portionType === "custom")
    ) {
      setError("Kies een geldige hoeveelheid");
      return;
    }

    let totalKcal = 0;
    let totalProteins = 0;
    let totalFats = 0;
    let totalSugars = 0;
    let amount = 1;

    if (portionType === "portion" && portionCount) {
      totalKcal = portionCount * selectedFood.kcal_per_portion;
      totalProteins =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.proteine_per_100) /
        100;
      totalFats =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.fats_per_100) /
        100;
      totalSugars =
        (portionCount *
          selectedFood.grams_per_portion *
          selectedFood.sugar_per_100) /
        100;
      amount = portionCount;
    } else if (portionType === "custom" && portionSize) {
      totalKcal = (portionSize / 100) * selectedFood.kcal_per_100;
      totalProteins = (portionSize / 100) * selectedFood.proteine_per_100;
      totalFats = (portionSize / 100) * selectedFood.fats_per_100;
      totalSugars = (portionSize / 100) * selectedFood.sugar_per_100;
      amount = parseFloat(
        (totalKcal / selectedFood.kcal_per_portion).toFixed(2)
      );
    } else {
      setError("Vul een geldige hoeveelheid in.");
      return;
    }

    try {
      await API.post("/daily-entries", {
        food_id: selectedFood.id,
        total_kcal: totalKcal,
        total_proteins: totalProteins,
        total_fats: totalFats,
        total_sugars: totalSugars,
        amount: amount,
        date: selectedDate.toISOString().split("T")[0], // Include selected date
      });
      setSelectedFood(null);
      setPortionCount("");
      setPortionSize("");
      setPortionType("portion");
      setError(null);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error("Error adding daily entry:", error);
      setError("Fout bij het toevoegen van voedselinvoer.");
    }
  };

  return (
    <Box sx={{ flex: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {showConfirmation && (
        <Alert severity="success" sx={{ mb: 1 }}>
          Voedsel succesvol toegevoegd!
        </Alert>
      )}
      {selectedFood ? (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Voeg Voedsel Toe: {selectedFood.name}
          </Typography>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Datum</Typography>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="app-date-input"
            />
            <FormControl size="small">
              <InputLabel id="portion-type-label">Hoeveelheidstype</InputLabel>
              <Select
              labelId="portion-type-label"
              label="Hoeveelheidstype"
              value={portionType}
              onChange={(e) => setPortionType(e.target.value)}
              >
                <MenuItem value="portion">Portie</MenuItem>
                <MenuItem value="custom">Aangepast (gram/ml)</MenuItem>
              </Select>
            </FormControl>
            {portionType === "portion" ? (
              <TextField
                size="small"
                label="Aantal porties"
                type="number"
                value={portionCount}
                onChange={(e) => setPortionCount(e.target.value)}
                min="0"
                step="0.01"
              />
            ) : (
              <TextField
                size="small"
                label="Hoeveelheid (gram/ml)"
                type="number"
                value={portionSize}
                onChange={(e) => setPortionSize(e.target.value)}
                min="0"
                step="0.01"
              />
            )}
            <Typography sx={{ color: "text.secondary" }}>
              {portionType === "portion" ? (
                <>
                  Een portie bevat {selectedFood.kcal_per_portion} kcal.
                  <br />
                  Beschrijving: {selectedFood.portion_description}.
                </>
              ) : (
                "Aangepaste hoeveelheid wordt berekend op basis van gram/ml."
              )}
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(79, 70, 229, 0.06)" }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Berekening
              </Typography>
              <Typography>
                <strong>Totaal kcal:</strong>{" "}
              {portionType === "portion"
                ? parseFloat(
                    (portionCount * selectedFood.kcal_per_portion).toFixed(2)
                  ) || 0
                : parseFloat(
                    ((portionSize / 100) * selectedFood.kcal_per_100).toFixed(2)
                  ) || 0}{" "}
              kcal
              </Typography>
              <Typography>
                <strong>Totaal proteïne:</strong>{" "}
              {portionType === "portion"
                ? parseFloat(
                    (
                      (portionCount *
                        selectedFood.grams_per_portion *
                        selectedFood.proteine_per_100) /
                      100
                    ).toFixed(2)
                  ) || 0
                : parseFloat(
                    (
                      (portionSize / 100) *
                      selectedFood.proteine_per_100
                    ).toFixed(2)
                  ) || 0}{" "}
              g
              </Typography>
              <Typography>
                <strong>Totaal vet:</strong>{" "}
              {portionType === "portion"
                ? parseFloat(
                    (
                      (portionCount *
                        selectedFood.grams_per_portion *
                        selectedFood.fats_per_100) /
                      100
                    ).toFixed(2)
                  ) || 0
                : parseFloat(
                    ((portionSize / 100) * selectedFood.fats_per_100).toFixed(2)
                  ) || 0}{" "}
              g
              </Typography>
              <Typography>
                <strong>Totaal suiker:</strong>{" "}
              {portionType === "portion"
                ? parseFloat(
                    (
                      (portionCount *
                        selectedFood.grams_per_portion *
                        selectedFood.sugar_per_100) /
                      100
                    ).toFixed(2)
                  ) || 0
                : parseFloat(
                    ((portionSize / 100) * selectedFood.sugar_per_100).toFixed(
                      2
                    )
                  ) || 0}{" "}
              g
              </Typography>
            </Box>
            <AppButton type="submit">Voeg Toe</AppButton>
          </Stack>
        </Box>
      ) : (
        <Typography>Selecteer voedsel aan de linkerkant</Typography>
      )}
    </Box>
  );
};

export default AddForm;
