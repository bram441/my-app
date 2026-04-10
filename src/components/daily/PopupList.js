import React from "react";
import { useState } from "react";
import { List, ListItem, ListItemText, Stack, TextField, Typography } from "@mui/material";
import AppButton from "../ui/AppButton";

const PopupList = ({
  dailyData,
  selectedEntry,
  onClickDelete,
  onClickUpdateAmount,
}) => {
  const [amountById, setAmountById] = useState({});

  const getEntryName = (entry) =>
    entry.entry_type === "food"
      ? entry.Food?.name || "Unknown Food"
      : entry.Recipe?.name || "Unknown Recipe";

  const matchesGroup = (entry) => {
    if (!selectedEntry) return false;
    if (selectedEntry.entry_type !== entry.entry_type) return false;
    if (entry.entry_type === "food") return entry.food_id === selectedEntry.food_id;
    if (entry.entry_type === "recipe")
      return entry.recipe_id === selectedEntry.recipe_id;
    return false;
  };

  const entries = dailyData.entriesSeperate.filter(matchesGroup);

  return (
    <List>
      {entries.length > 0 ? (
        entries.map((entry) => (
            <ListItem key={entry.id} divider>
              <ListItemText
                primary={`${entry.amount}x ${getEntryName(entry)}`}
                secondary={`${parseFloat(entry.total_kcal.toFixed(1))} kcal`}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    amountById[entry.id] !== undefined
                      ? amountById[entry.id]
                      : entry.amount
                  }
                  onChange={(e) =>
                    setAmountById((prev) => ({
                      ...prev,
                      [entry.id]: e.target.value,
                    }))
                  }
                  sx={{ width: 110 }}
                  aria-label="Update amount"
                />
                <AppButton
                  onClick={() =>
                    onClickUpdateAmount(entry.id, amountById[entry.id] ?? entry.amount)
                  }
                  variant="secondary"
                >
                  Save
                </AppButton>
                <AppButton variant="danger" onClick={() => onClickDelete(entry.id)}>
                  Delete
                </AppButton>
              </Stack>
            </ListItem>
          ))
      ) : (
        <Typography>Geen eten meer</Typography>
      )}
    </List>
  );
};

export default PopupList;
