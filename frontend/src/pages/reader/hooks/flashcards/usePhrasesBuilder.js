import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext"; // Укажите правильный путь к AuthContext

const API_URL =
  "https://your-personal-bookshelf.onrender.com/api/v1/ai/phrases";

export const usePhrasesBuilder = (
  selectedText,
  contextText = "",
  targetLang = "EN",
) => {
  const { token } = useAuth(); // 👈 Достаем токен авторизации
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phrases, setPhrases] = useState([]);

  useEffect(() => {
    if (!selectedText) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchPhrases = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }), // 👈 Передаем токен
          },
          body: JSON.stringify({
            selectedText: selectedText,
            context: contextText || selectedText,
            targetLang: targetLang, // 👈 Передается актуальный язык
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setPhrases(data);
          setLoading(false);
        }
      } catch (err) {
        if (err.name === "AbortError") return;

        if (isMounted) {
          console.error("Ошибка при получении фраз от ИИ:", err);
          setError("Не удалось загрузить варианты фраз. Попробуйте еще раз.");
          setLoading(false);
        }
      }
    };

    fetchPhrases();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [selectedText, contextText, targetLang, token]); // 👈 token добавлен в зависимости

  const handleCreateCard = useCallback((phrase) => {
    console.log("Создание карточки для:", phrase);
  }, []);

  return {
    loading,
    error,
    phrases,
    handleCreateCard,
  };
};
