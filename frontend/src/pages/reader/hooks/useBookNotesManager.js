import { useState, useCallback } from 'react';
import { useBookNotes } from '../../../context/BookNotesContext'; // подправь путь при необходимости

export const useBookNotesManager = (bookId, jumpToCfi) => {
    const { bookNotes, loadingNotes, fetchNotes, deleteNote } = useBookNotes();

    const [isNotesListOpen, setIsNotesListOpen] = useState(false);
    const [activeDetailNote, setActiveDetailNote] = useState(null);

    // Открытие/закрытие списка заметок с автозагрузкой данных
    const handleToggleNotesList = useCallback(() => {
        if (!isNotesListOpen) {
            fetchNotes(bookId);
        } else {
            // Если закрываем весь список кнопкой из сайдбара — сбрасываем и открытые детали
            setActiveDetailNote(null);
        }
        setIsNotesListOpen((prev) => !prev);
    }, [isNotesListOpen, fetchNotes, bookId]);

    // Закрытие ВСЕГО интерфейса заметок (при клике на оверлей или крестик списка)
    const handleCloseNotesList = useCallback(() => {
        setIsNotesListOpen(false);
        setActiveDetailNote(null); // Закрываем детали тоже
    }, []);

    // Закрытие ТОЛЬКО деталей заметки (при клике на крестик в деталях)
    const handleCloseDetailNote = useCallback(() => {
        setActiveDetailNote(null); // Список заметок остается открытым
    }, []);

    // Переход к заметке в книге
    const handleJumpToNote = useCallback((cfi) => {
        if (jumpToCfi) {
            jumpToCfi(cfi);
        }
        setIsNotesListOpen(false);
        setActiveDetailNote(null);
    }, [jumpToCfi]);

    // Удаление заметки из детальной карточки
    const handleDeleteNote = useCallback((noteId) => {
        if (window.confirm("Вы уверены, что хотите удалить эту заметку?")) {
            deleteNote(noteId);
            setActiveDetailNote(null); // Закрываем детали после удаления
        }
    }, [deleteNote]);

    return {
        bookNotes,
        loadingNotes,
        isNotesListOpen,
        setIsNotesListOpen,
        activeDetailNote,
        setActiveDetailNote,
        handleToggleNotesList,
        handleCloseNotesList,     // <-- Новый обработчик
        handleCloseDetailNote,    // <-- Новый обработчик
        handleJumpToNote,
        handleDeleteNote
    };
};