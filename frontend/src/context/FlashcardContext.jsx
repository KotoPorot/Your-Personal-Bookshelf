import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

const FlashcardContext = createContext(null);

const API_BASE_URL = "http://localhost:8080/api/v1/flashcards";

export const FlashcardProvider = ({ children }) => {
  const { token } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      };

      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorMessage = "Ошибка при выполнении запроса";
        try {
          const errData = await response.json();
          errorMessage = errData.message || errorMessage;
        } catch (_) {}
        throw new Error(errorMessage);
      }

      if (response.status === 204) return null;
      return response.json();
    },
    [token],
  );

  const fetchAllCards = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(API_BASE_URL);
      setCards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, fetchWithAuth]);

  const fetchCardsByFolder = useCallback(
    async (folderId) => {
      if (!token || !folderId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWithAuth(
          `${API_BASE_URL}?folderId=${folderId}`,
        );
        setCards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [token, fetchWithAuth],
  );

  const createCard = async (cardPayload) => {
    setError(null);
    try {
      const newCard = await fetchWithAuth(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify(cardPayload),
      });

      setCards((prev) => [newCard, ...prev]);
      return newCard;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCard = async (updatePayload) => {
    setError(null);
    try {
      const updatedCard = await fetchWithAuth(API_BASE_URL, {
        method: "PUT",
        body: JSON.stringify(updatePayload),
      });

      setCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
      );
      return updatedCard;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const moveCard = async (cardId, newFolderId) => {
    setError(null);
    try {
      const updatedCard = await fetchWithAuth(
        `${API_BASE_URL}/${cardId}/folder/${newFolderId}`,
        { method: "PUT" },
      );

      setCards((prev) =>
        prev.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
      );
      return updatedCard;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCard = async (cardId) => {
    setError(null);
    try {
      await fetchWithAuth(`${API_BASE_URL}/${cardId}`, {
        method: "DELETE",
      });

      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // 7. Имитация API для экспорта карточек
  const exportCards = async (cardIds) => {
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE_URL}/export`, {
        method: "POST",
        body: JSON.stringify({ cardIds }),
      });
      return data.exportedText;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <FlashcardContext.Provider
      value={{
        cards,
        setCards,
        loading,
        error,
        fetchAllCards,
        fetchCardsByFolder,
        createCard,
        updateCard,
        moveCard,
        deleteCard,
        exportCards,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error("useFlashcards must be used within a FlashcardProvider");
  }
  return context;
};
