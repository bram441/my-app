import { FormControl, MenuItem, Select } from "@mui/material";
import { useLanguage } from "../../context/LanguageContext";

const LanguageSwitcher = ({ compact = false }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <FormControl size="small" sx={{ minWidth: compact ? 120 : 160 }}>
      <Select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <MenuItem value="en">{t("language.english")}</MenuItem>
        <MenuItem value="nl">{t("language.dutch")}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;
