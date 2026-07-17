import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext'; // <-- Подключаем контекст авторизации
import { handleRequestError } from '../../../utils/apiErrorHandler'; // <-- Унифицированная обработка ошибок

export const useTextSelection = ({ bookId }) => {
    const { token, logout, activeBook } = useAuth(); // <-- Получаем токен, logout и активную книгу

    // Состояние для плавающего меню выделения
    const [selectionMenu, setSelectionMenu] = useState({
        visible: false,
        top: 0,
        left: 0,
        text: '',
        cfi: ''
    });

    // Состояние для модалки создания заметки
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteComment, setNoteComment] = useState('');

    // Вызывается, когда epub.js ловит выделение текста
    const handleTextSelected = useCallback(({ cfi, text, top, left }) => {
        console.log(`%c📝 [useTextSelection] Текст выделен. CFI: ${cfi}`, "color: #0288d1; font-weight: bold;");
        setSelectionMenu({
            visible: true,
            top,
            left,
            text,
            cfi
        });
    }, []);

    const closeSelectionMenu = useCallback(() => {
        setSelectionMenu(prev => ({ ...prev, visible: false }));
    }, []);

    const openNoteModal = useCallback(() => {
        setIsNoteModalOpen(true);
        closeSelectionMenu();
    }, [closeSelectionMenu]);

    const closeNoteModal = useCallback(() => {
        setIsNoteModalOpen(false);
        setNoteComment(''); // Очищаем поле ввода при закрытии
    }, []);

    const handleSaveNote = useCallback(async () => {
        console.log("%c💾 [API] Сохранение заметки в базу данных...", "color: #2e7d32; font-weight: bold;");

        if (!token) {
            console.error("Ошибка сохранения заметки: отсутствует токен авторизации");
            return;
        }

        // Формируем payload, добавляя метаданные из контекста активной книги
        const notePayload = {
            bookId: Number(bookId),
            cfi: selectionMenu.cfi,
            selectedText: selectionMenu.text,
            //TODO rename to userComment
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
            closeNoteModal();
        } catch (err) {
            console.error("Не удалось сохранить заметку:", err);
            handleRequestError(err, logout);
        }
    }, [bookId, selectionMenu, noteComment, closeNoteModal, token, logout, activeBook]);

    return {
        selectionMenu,
        isNoteModalOpen,
        noteComment,
        setNoteComment,
        handleTextSelected,
        closeSelectionMenu,
        openNoteModal,
        closeNoteModal,
        handleSaveNote
    };
};