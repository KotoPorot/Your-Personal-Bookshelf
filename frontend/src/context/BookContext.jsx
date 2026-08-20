import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { handleRequestError } from "../utils/apiErrorHandler"; // Поправь путь, если нужно

const BookContext = createContext(null);

export const BookProvider = ({ children }) => {
  const { token, logout } = useAuth();
  const [shelves, setShelves] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeShelfId, setActiveShelfId] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // 1. Получение полок при монтировании / изменении токена
  useEffect(() => {
    const fetchShelves = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await axios.get(
          "https://your-personal-bookshelf.onrender.com/api/v1/shelves/getAll",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = response.data;
        setShelves(data);

        if (data.length > 0) {
          const savedShelfId = localStorage.getItem("lastSelectedShelfId");
          const exists = data.find((s) => s.id === Number(savedShelfId));
          if (exists) {
            setActiveShelfId(exists.id);
          } else {
            setActiveShelfId(data[0].id);
            localStorage.setItem("lastSelectedShelfId", data[0].id);
          }
        }
      } catch (err) {
        handleRequestError(err, logout);
      } finally {
        setLoading(false);
      }
    };

    fetchShelves();
  }, [token]);

  // 2. Получение книг при изменении активной полки
  useEffect(() => {
    const fetchBooks = async () => {
      if (!token || !activeShelfId) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `https://your-personal-bookshelf.onrender.com/api/v1/books/getBooks/${activeShelfId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setBooks(response.data);
      } catch (err) {
        handleRequestError(err, logout);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [token, activeShelfId]);

  // Смена активной полки с сохранением в localStorage
  const selectShelf = (id) => {
    setActiveShelfId(id);
    if (id) {
      localStorage.setItem("lastSelectedShelfId", id);
    } else {
      localStorage.removeItem("lastSelectedShelfId");
    }
  };

  // --- МЕТОДЫ УПРАВЛЕНИЯ ПОЛКАМИ ---

  const createShelf = async (shelfName) => {
    try {
      const response = await axios.post(
        "https://your-personal-bookshelf.onrender.com/api/v1/shelves/createShelf",
        { shelfName },
        apiHeaders,
      );
      setShelves((prev) => [...prev, response.data]);
      selectShelf(response.data.id);
    } catch (err) {
      handleRequestError(err, logout);
    }
  };

  const editShelfName = async (id, newName) => {
    try {
      const response = await axios.put(
        `https://your-personal-bookshelf.onrender.com/api/v1/shelves/updateShelfName/${id}`,
        { shelfName: newName },
        apiHeaders,
      );
      setShelves((prev) => prev.map((s) => (s.id === id ? response.data : s)));
    } catch (err) {
      handleRequestError(err, logout);
    }
  };

  const deleteShelf = async (id) => {
    try {
      await axios.delete(
        `https://your-personal-bookshelf.onrender.com/api/v1/shelves/deleteShelf/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedShelves = shelves.filter((s) => s.id !== id);
      setShelves(updatedShelves);

      if (activeShelfId === id) {
        if (updatedShelves.length > 0) {
          selectShelf(updatedShelves[0].id);
        } else {
          selectShelf(null);
        }
      }
    } catch (err) {
      handleRequestError(err, logout);
    }
  };

  // --- МЕТОДЫ УПРАВЛЕНИЯ КНИГАМИ ---

  const addBookToState = (newBook) => {
    setBooks((prev) => [...prev, newBook]);
  };

  const renameBook = async (bookId, newTitle) => {
    try {
      const response = await axios.patch(
        `https://your-personal-bookshelf.onrender.com/api/v1/books/rename/${bookId}`,
        { newTitle },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? response.data : b)),
      );
      return response.data; // Возвращаем обновленную книгу для локального стейта модалки
    } catch (err) {
      handleRequestError(err, logout);
    }
  };

  const changeBookShelf = async (bookId, newShelfId) => {
    try {
      await axios.patch(
        `https://your-personal-bookshelf.onrender.com/api/v1/books/changeShelf/${bookId}`,
        { newShelfId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      handleRequestError(err, logout);
    }
  };

  const deleteBook = async (bookId) => {
    try {
      await axios.delete(
        `https://your-personal-bookshelf.onrender.com/api/v1/books/deleteBook/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      handleRequestError(err, logout);
    }
  };

  return (
    <BookContext.Provider
      value={{
        shelves,
        books,
        activeShelfId,
        loading,
        selectShelf,
        createShelf,
        editShelfName,
        deleteShelf,
        addBookToState,
        renameBook,
        changeBookShelf,
        deleteBook,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => useContext(BookContext);
