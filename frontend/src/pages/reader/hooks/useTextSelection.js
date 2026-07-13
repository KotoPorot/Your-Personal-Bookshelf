import { useState, useCallback } from 'react';

export const useTextSelection = ({ bookId }) => {
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

    const handleSaveNote = useCallback(() => {
        console.log("%c💾 [API] Сохранение заметки в базу данных...", "color: #2e7d32; font-weight: bold;");
        console.log({
            bookId,
            cfi: selectionMenu.cfi,
            selectedText: selectionMenu.text,
            noteText: noteComment,
            createdAt: new Date().toISOString()
        });

        // TODO: Здесь будет вызов fetch/axios для отправки на бэкенд

        closeNoteModal();
    }, [bookId, selectionMenu, noteComment, closeNoteModal]);

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