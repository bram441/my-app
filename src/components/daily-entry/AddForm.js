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
import { useLanguage } from "../../context/LanguageContext";

const AddForm = ({ selectedFood, setSelectedFood }) => {
  const { t } = useLanguage();
  const { selectedDate, setSelectedDate } = useContext(AuthContext);
  const [portionType, setPortionType] = useState("portion"); // "custom" or "portion"
  const [portionSize, setPortionSize] = useState(""); // Custom input (grams/ml)
  const [portionCount, setPortionCount] = useState(""); // Portion selection
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFood) {
      setError(t("addFoodEntry.selectFood"));
      return;
    }

    if (
      (portionCount === 0 && portionType === "portion") ||
      (portionSize === 0 && portionType === "custom")
    ) {
      setError(t("addFoodEntry.validAmount"));
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
      setError(t("addFoodEntry.invalidAmount"));
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
      setError(t("addFoodEntry.addFailed"));
    }
  };

  return (
    <Box sx={{ flex: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {showConfirmation && (
        <Alert severity="success" sx={{ mb: 1 }}>
          {t("addFoodEntry.addedSuccess")}
        </Alert>
      )}
      {selectedFood ? (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t("addFoodEntry.addFood")}: {selectedFood.name}
          </Typography>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t("addFoodEntry.date")}</Typography>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="app-date-input"
            />
            <FormControl size="small">
              <InputLabel id="portion-type-label">{t("addFoodEntry.amountType")}</InputLabel>
              <Select
              labelId="portion-type-label"
              label={t("addFoodEntry.amountType")}
              value={portionType}
              onChange={(e) => setPortionType(e.target.value)}
              >
                <MenuItem value="portion">{t("addFoodEntry.portion")}</MenuItem>
                <MenuItem value="custom">{t("addFoodEntry.custom")}</MenuItem>
              </Select>
            </FormControl>
            {portionType === "portion" ? (
              <TextField
                size="small"
                label={t("addFoodEntry.portionsCount")}
                type="number"
                value={portionCount}
                onChange={(e) => setPortionCount(e.target.value)}
                min="0"
                step="0.01"
              />
            ) : (
              <TextField
                size="small"
                label={t("addFoodEntry.customAmount")}
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
                  {t("addFoodEntry.portionContains")} {selectedFood.kcal_per_portion} kcal.
                  <br />
                  {t("addFoodEntry.description")}: {selectedFood.portion_description}.
                </>
              ) : (
                t("addFoodEntry.customHelp")
              )}
            </Typography>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(79, 70, 229, 0.06)" }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {t("addFoodEntry.calculation")}
              </Typography>
              <Typography>
                <strong>{t("addFoodEntry.totalKcal")}:</strong>{" "}
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
                <strong>{t("addFoodEntry.totalProteins")}:</strong>{" "}
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
                <strong>{t("addFoodEntry.totalFats")}:</strong>{" "}
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
                <strong>{t("addFoodEntry.totalSugars")}:</strong>{" "}
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
            <AppButton type="submit">{t("addFoodEntry.add")}</AppButton>
          </Stack>
        </Box>
      ) : (
        <Typography>{t("addFoodEntry.selectLeft")}</Typography>
      )}
    </Box>
  );
};

export default AddForm;
