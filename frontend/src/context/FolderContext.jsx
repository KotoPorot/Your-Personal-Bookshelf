import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const FolderContext = createContext(null);

const API_BASE_URL = "http://localhost:8080/api/v1/flashcards/folders";

export const FolderProvider = ({ children }) => {
  const { token } = useAuth();
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Вспомогательный метод для выполнения авторизованных запросов
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

      // Если 204 No Content
      if (response.status === 204) return null;

      return response.json();
    },
    [token],
  );

  // Загрузка всех папок
  const fetchFolders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(API_BASE_URL);
      setFolders(data);

      // Если активная папка не выбрана или больше не существует — выберем первую доступную
      setActiveFolderId((prevId) => {
        if (data.some((f) => f.id === prevId)) return prevId;
        return data.length > 0 ? data[0].id : null;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, fetchWithAuth]);

  // Загружаем папки при монтировании или смене токена
  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Создание папки
  const createFolder = async (name) => {
    setError(null);
    try {
      const newFolder = await fetchWithAuth(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setFolders((prev) => [...prev, newFolder]);
      setActiveFolderId(newFolder.id);
      return newFolder;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Редактирование папки
  const updateFolder = async (id, newName) => {
    setError(null);
    try {
      const updatedFolder = await fetchWithAuth(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: newName }),
      });
      setFolders((prev) => prev.map((f) => (f.id === id ? updatedFolder : f)));
      return updatedFolder;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Удаление папки
  const deleteFolder = async (id) => {
    setError(null);
    try {
      await fetchWithAuth(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      setFolders((prev) => {
        const filtered = prev.filter((f) => f.id !== id);
        // Если удалили активную папку, переключаемся на первую из оставшихся
        if (activeFolderId === id) {
          setActiveFolderId(filtered[0]?.id || null);
        }
        return filtered;
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <FolderContext.Provider
      value={{
        folders,
        activeFolderId,
        setActiveFolderId,
        loading,
        error,
        fetchFolders,
        createFolder,
        updateFolder,
        deleteFolder,
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export const useFolder = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolder must be used within a FolderProvider");
  }
  return context;
};
