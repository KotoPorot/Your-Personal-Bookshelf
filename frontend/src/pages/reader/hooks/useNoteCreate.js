// src/pages/reader/hooks/sub-hooks/useNoteCreate.js
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useBookNotes } from '../../../context/BookNotesContext';
import { handleRequestError } from '../../../utils/apiErrorHandler';

export const useNoteCreate = ({
    bookId,
    selectionMenu,
    closeSelectionMenu,
    clearBrowserSelection
}) => {
    const { token, logout, activeBook } = useAuth();
    const { fetchNotes } = useBookNotes();

    // Состояние модалки создания заметки и текста внутри неё
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteComment, setNoteComment] = useState('');

    const openNoteModal = useCallback(() => {
        setIsNoteModalOpen(true);
        closeSelectionMenu(); // Закрываем маленькое плавающее меню при открытии полноценной модалки
    }, [closeSelectionMenu]);

    const closeNoteModal = useCallback(() => {
        setIsNoteModalOpen(false);
        setNoteComment(''); // Очищаем поле ввода при закрытии

        // Убираем синеву с микро-таймаутом, чтобы браузер успел переключить фокус с инпута
        setTimeout(() => {
            clearBrowserSelection();
        }, 50);
    }, [clearBrowserSelection]);

    const handleSaveNote = useCallback(async () => {
        console.log("%c💾 [API] Сохранение заметки в базу данных...", "color: #2e7d32; font-weight: bold;");

        if (!token) {
            console.error("Ошибка сохранения заметки: отсутствует токен авторизации");
            return;
        }

        const notePayload = {
            bookId: Number(bookId),
            cfi: selectionMenu.cfi,
            selectedText: selectionMenu.text,
            userNote: noteComment,
            bookTitle: activeBook?.title || 'Unknown Title',
            bookAuthor: activeBook?.author || 'Unknown Author',
            createdAt: new Date().toISOString()
        };

        try {
            await axios.post('http://localhost:8080/api/v1/notes/create', notePayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("%c✅ [API] Заметка успешно сохранена!", "color: #2e7d32; font-weight: bold;");
            await fetchNotes(bookId);
            closeNoteModal();

        } catch (err) {
            console.error("Не удалось сохранить заметку:", err);
            handleRequestError(err, logout);
        }
    }, [bookId, selectionMenu, noteComment, closeNoteModal, token, logout, activeBook, fetchNotes]);

    return {
        isNoteModalOpen,
        noteComment,
        setNoteComment,
        openNoteModal,
        closeNoteModal,
        handleSaveNote
    };
};