import { createContext, useContext, useMemo, useState } from "react";
import translations from "../i18n/translations";

const STORAGE_KEY = "app_language";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

const getInitialLanguage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "nl" || saved === "en") {
    return saved;
  }
  return "en";
};

const getByPath = (source, path) => {
  return path.split(".").reduce((acc, part) => acc?.[part], source);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (next) => {
    const safeLanguage = next === "nl" ? "nl" : "en";
    setLanguageState(safeLanguage);
    localStorage.setItem(STORAGE_KEY, safeLanguage);
  };

  const value = useMemo(() => {
    const t = (key) => {
      const localized = getByPath(translations[language], key);
      if (localized !== undefined) return localized;
      return getByPath(translations.en, key) ?? key;
    };

    return {
      language,
      setLanguage,
      t,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
