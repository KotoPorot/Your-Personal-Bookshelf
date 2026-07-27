import { useState, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { useTranslationSettings } from "../../../../context/TranslationContext";

export const useTranslate = () => {
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth();
  const { sourceLanguage, targetLanguage } = useTranslationSettings();

  const translate = useCallback(
    async (text) => {
      if (!text) return;

      if (!token) {
        setError("Ошибка: отсутствует токен авторизации");
        return;
      }

      setIsLoading(true);
      setError(null);
      setTranslatedText("");

      const contentLanguage = sourceLanguage === "AUTO" ? null : sourceLanguage;
      const payload = { message: text, targetLanguage, contentLanguage };

      try {
        console.log(
          "%c💬 [API] Запрос на перевод отправлен",
          "color: #1565c0; font-weight: bold;",
        );
        console.log(
          "%c💬 [API] Тело запроса:",
          "color: #1565c0; font-weight: bold;",
          payload,
        );

        const response = await fetch("http://localhost:8080/api/v1/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        console.log(
          "%c💬 [API] Ответ сервера:",
          "color: #1565c0; font-weight: bold;",
          response,
        );

        if (!response.ok) {
          throw new Error("Ошибка при получении перевода");
        }

        const data = await response.json();
        setTranslatedText(data.response || "");
      } catch (err) {
        console.error("Ошибка перевода:", err);
        setError(err.message || "Не удалось перевести текст");
      } finally {
        setIsLoading(false);
      }
    },
    [token, sourceLanguage, targetLanguage],
  );

  const reset = useCallback(() => {
    setTranslatedText("");
    setIsLoading(false);
    setError(null);
  }, []);

  return { translatedText, isLoading, error, translate, reset };
};
