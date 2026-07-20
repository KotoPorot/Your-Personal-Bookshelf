import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios'; // Импортируем axios
import { useAuth } from './AuthContext';

const BookNotesContext = createContext(null);

export const BookNotesProvider = ({ children }) => {
    const { token } = useAuth();
    const [bookNotes, setBookNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    const BASE_URL = 'http://localhost:8080/api/v1/notes';

    // Вспомогательная функция для ручной сборки заголовков
    const getHeaders = useCallback(() => ({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }), [token]);

    // Запрос к API для получения заметок
    const fetchNotes = useCallback(async (bookId) => {
        if (!token) return;

        setLoadingNotes(true);
        try {
            // В Axios параметры запроса (query params) изящнее передавать через объект params
            const response = await axios.get(`${BASE_URL}/get-user-notes`, {
                params: { bookId },
                headers: getHeaders()
            });

            // Данные от сервера уже лежат в response.data в виде готового массива/объекта
            console.log("👉 СЕЙЧАС С СЕРВЕРА ПРИХОДИТ(notes):", response.data);
            setBookNotes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            // Axios инкапсулирует ответ сервера с ошибкой в error.response
            console.error("Ошибка при загрузке заметок:", error.response?.data || error.message);
        } finally {
            setLoadingNotes(false);
        }
    }, [token, getHeaders]);

    // Удаление заметки
    const deleteNote = useCallback(async (noteId) => {
        if (!token) return;

        try {
            // Отправляем DELETE запрос. Проверка !response.ok больше не нужна,
            // так как любой статус кроме 2xx автоматически отправляет выполнение в блок catch.
            await axios.delete(`${BASE_URL}/delete/${noteId}`, {
                headers: getHeaders()
            });

            // Обновляем контекст локально после успешного удаления на бэкенде (204 No Content)
            setBookNotes((prev) => prev.filter((note) => note.noteId !== noteId));
        } catch (error) {
            console.error("Ошибка при удалении заметки:", error.response?.data || error.message);
        }
    }, [token, getHeaders]); // Добавили зависимости, чтобы предотвратить замыкание старого токена

    return (
        <BookNotesContext.Provider value={{ bookNotes, setBookNotes, loadingNotes, fetchNotes, deleteNote }}>
            {children}
        </BookNotesContext.Provider>
    );
};

export const useBookNotes = () => {
    const context = useContext(BookNotesContext);
    if (!context) {
        throw new Error('useBookNotes должен использоваться внутри BookNotesProvider');
    }
    return context;
};