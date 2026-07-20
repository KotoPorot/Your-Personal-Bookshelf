import { useState, useCallback, useEffect } from 'react';
import { useBookNotes } from '../../../../context/BookNotesContext';

export const useBookNotesManager = (bookId, jumpToCfi) => {
    const { bookNotes, loadingNotes, fetchNotes, deleteNote } = useBookNotes();

    const [isNotesListOpen, setIsNotesListOpen] = useState(false);
    const [activeDetailNote, setActiveDetailNote] = useState(null);

    // Авто-загрузка заметок при инициализации или смене книги
    useEffect(() => {
        if (bookId) {
            console.log(`[useBookNotesManager] Авто-загрузка заметок для книги ${bookId} при старте`);
            fetchNotes(bookId);
        }
    }, [bookId, fetchNotes]);

    // Открытие/закрытие списка заметок с автозагрузкой данных
    const handleToggleNotesList = useCallback(() => {
        if (isNotesListOpen) {
            setActiveDetailNote(null);
        } else {
            fetchNotes(bookId);
        }
        setIsNotesListOpen((prev) => !prev);
    }, [isNotesListOpen, fetchNotes, bookId]);

    // Закрытие ВСЕГО интерфейса заметок
    const handleCloseNotesList = useCallback(() => {
        setIsNotesListOpen(false);
        setActiveDetailNote(null);
    }, []);

    // Закрытие ТОЛЬКО деталей заметки
    const handleCloseDetailNote = useCallback(() => {
        setActiveDetailNote(null);
    }, []);

    // Переход к заметке в книге
    const handleJumpToNote = useCallback((cfi) => {
        if (typeof jumpToCfi === 'function') {
            jumpToCfi(cfi);
        }
        setIsNotesListOpen(false);
        setActiveDetailNote(null);
    }, [jumpToCfi]);

    // Удаление заметки
    const handleDeleteNote = useCallback((noteId) => {
        if (window.confirm("Вы уверены, что хотите удалить эту заметку?")) {
            deleteNote(noteId);
            setActiveDetailNote(null);
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
        handleCloseNotesList,
        handleCloseDetailNote,
        handleJumpToNote,
        handleDeleteNote
    };
};