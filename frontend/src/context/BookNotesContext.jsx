import React, { createContext, useContext, useState, useCallback } from 'react';

const BookNotesContext = createContext(null);

export const BookNotesProvider = ({ children }) => {
    const [bookNotes, setBookNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(false);

    // Запрос к API (пока заглушка с имитацией задержки)
    const fetchNotes = useCallback(async (bookId) => {
        setLoadingNotes(true);
        try {
            // В будущем здесь будет реальный запрос:
            // const response = await fetch(`/api/v1/notes?bookId=${bookId}`);
            // const data = await response.json();
            // setBookNotes(data);

            // Имитация ответа от бэкенда
            const mockNotes = [
                {
                    noteId: 101,
                    bookId: bookId,
                    bookTitle: "Тестовая книга",
                    selectedText: "Это пример выделенного текста из первой главы, который юзер посчитал очень важным.",
                    userNote: "Мой личный комментарий к этой мысли. Нужно будет перечитать на досуге.",
                    cfi: "epubcfi(/6/4!/4/2[sec0002]/10/1:0)", // Пример CFI
                    createdAt: new Date().toISOString()
                },
                {
                    noteId: 102,
                    bookId: bookId,
                    bookTitle: "Тестовая книга",
                    selectedText: "Другая интересная цитата, сохраненная ранее.",
                    userNote: "Искать подробности в главе 5.",
                    cfi: "epubcfi(/6/12!/4/2[sec0006]/20/1:0)",
                    createdAt: new Date(Date.now() - 86400000).toISOString()
                }
            ];

            await new Promise((resolve) => setTimeout(resolve, 600)); // Имитируем сеть
            setBookNotes(mockNotes);
        } catch (error) {
            console.error("Ошибка при загрузке заметок:", error);
        } finally {
            setLoadingNotes(false);
        }
    }, []);

    // Удаление заметки
    const deleteNote = useCallback(async (noteId) => {
        try {
            // В будущем здесь будет реальный запрос:
            // await fetch(`/api/v1/notes/${noteId}`, { method: 'DELETE' });

            // Обновляем контекст локально после успешного удаления
            setBookNotes((prev) => prev.filter((note) => note.noteId !== noteId));
        } catch (error) {
            console.error("Ошибка при удалении заметки:", error);
        }
    }, []);

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