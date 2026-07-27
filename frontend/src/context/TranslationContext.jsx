import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const TranslationContext = createContext(null);

export const TranslationProvider = ({ children }) => {
  const { token } = useAuth();

  // Язык-источник ("AUTO" = Автоопределение)
  const [sourceLanguage, setSourceLanguage] = useState(() => {
    return localStorage.getItem("translator_source_lang") || "AUTO";
  });

  // Язык назначения по умолчанию (EN)
  const [targetLanguage, setTargetLanguage] = useState(() => {
    return localStorage.getItem("translator_target_lang") || "EN";
  });

  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [loadingLangs, setLoadingLangs] = useState(false);

  // Загрузка поддерживаемых языков с бэкенда
  useEffect(() => {
    const fetchLanguages = async () => {
      if (!token) return;
      setLoadingLangs(true);
      try {
        // Вызываем контроллер: /api/v1/translate/lang
        const response = await fetch(
          "http://localhost:8080/api/v1/translate/lang",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (response.ok) {
          const languages = await response.json();
          // Ожидаем массив записей LangResponse: [{ lang: "EN", name: "English" }, ...]
          setAvailableLanguages(languages);
        }
      } catch (err) {
        console.error("Ошибка при загрузке языков перевода:", err);
      } finally {
        setLoadingLangs(false);
      }
    };

    fetchLanguages();
  }, [token]);

  const saveSettings = useCallback((newSource, newTarget) => {
    setSourceLanguage(newSource);
    setTargetLanguage(newTarget);
    localStorage.setItem("translator_source_lang", newSource);
    localStorage.setItem("translator_target_lang", newTarget);
  }, []);

  return (
    <TranslationContext.Provider
      value={{
        sourceLanguage,
        targetLanguage,
        availableLanguages,
        loadingLangs,
        saveSettings,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationSettings = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslationSettings должен использоваться внутри TranslationProvider",
    );
  }
  return context;
};
