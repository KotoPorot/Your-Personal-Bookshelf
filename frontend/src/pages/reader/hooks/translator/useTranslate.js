// src/hooks/useTranslate.js (или где у тебя лежат хуки)
import { useState, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { handleRequestError } from "../../../../utils/apiErrorHandler";

export const useTranslate = () => {
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const translate = useCallback(
    async (text, targetLanguage = "EN", contentLanguage = null) => {
      if (!text) return;

      if (!token) {
        setError("Ошибка: отсутствует токен авторизации");
        return;
      }

      setIsLoading(true);
      setError(null);
      setTranslatedText("");

      try {
        // Отправляем запрос на твой Spring Boot API
        const response = await fetch("http://localhost:8080/api/v1/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: text,
            targetLanguage: targetLanguage,
            contentLanguage: contentLanguage, // можно передать null, DeepL сам определит
          }),
        });

        console.log(
          "%c💬 [API] Запрос на перевод отправлен",
          "color: #1565c0; font-weight: bold;",
        );
        console.log(
          "%c💬 [API] Тело запроса:",
          "color: #1565c0; font-weight: bold;",
          {
            message: text,
            targetLanguage: targetLanguage,
            contentLanguage: contentLanguage,
          },
        );
        console.log(
          "%c💬 [API] Ответ сервера:",
          "color: #1565c0; font-weight: bold;",
          response,
        );

        if (!response.ok) {
          throw new Error("Ошибка при получении перевода");
        }

        // Допустим, твой бэкенд возвращает простую строку.
        // Если он возвращает JSON (например, { "response": "Привет" }), поменяй на await response.json()
        const data = await response.json();
        setTranslatedText(data.response || "");
      } catch (err) {
        setError(err.message || "Не удалось перевести текст");
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  // Функция для сброса состояния (когда окно закрывается)
  const reset = useCallback(() => {
    setTranslatedText("");
    setIsLoading(false);
    setError(null);
  }, []);

  return { translatedText, isLoading, error, translate, reset };
};
