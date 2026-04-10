import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { IconButton, List, ListItem, ListItemText, Typography } from "@mui/material";

const DailyList = ({ dailyData, onClickEdit, selectedDate }) => {
  return (
    <List
      sx={{
        mt: 1,
        maxHeight: { xs: 300, lg: 360 },
        overflowY: "auto",
        borderRadius: 2,
        border: "1px solid rgba(15,23,42,0.08)",
        bgcolor: "rgba(255,255,255,0.7)",
      }}
    >
      {dailyData.entries.length > 0 ? (
        dailyData.entries.map((entry) => (
          <ListItem
            key={`${entry.entry_type}:${entry.entry_type === "food" ? entry.food_id : entry.recipe_id}`}
            divider
            secondaryAction={
              <IconButton
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary", bgcolor: "rgba(15,23,42,0.08)" },
                }}
                onClick={() =>
                  onClickEdit({
                    entry_type: entry.entry_type,
                    food_id: entry.food_id,
                    recipe_id: entry.recipe_id,
                    name: entry.name,
                  })
                }
              >
                <FontAwesomeIcon icon={faEdit} />
              </IconButton>
            }
          >
            <ListItemText
              primary={
                <Typography fontWeight={700}>
                  {entry.amount}x {entry.name}
                </Typography>
              }
              secondary={`Proteins: ${parseFloat(entry.total_proteins).toFixed(
                2
              )} g | Fats: ${parseFloat(entry.total_fats).toFixed(
                2
              )} g | Sugars: ${parseFloat(entry.total_sugars).toFixed(
                2
              )} g | ${parseFloat(entry.total_kcal.toFixed(1))} kcal`}
            />
          </ListItem>
        ))
      ) : (
        <Typography>No food logged for {selectedDate.toISOString().split("T")[0]}</Typography>
      )}
    </List>
  );
};

export default DailyList;
