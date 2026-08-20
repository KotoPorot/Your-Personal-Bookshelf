import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { useBookNotes } from "../../../../context/BookNotesContext";
import { handleRequestError } from "../../../../utils/apiErrorHandler";

export const useNoteCreate = ({
  bookId,
  selectionMenu,
  closeSelectionMenu,
  clearBrowserSelection,
}) => {
  const { token, logout, activeBook } = useAuth();
  const { fetchNotes } = useBookNotes();

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteComment, setNoteComment] = useState("");

  // Храним актуальное значение текста в рефе для разрыва жесткой зависимости колбэка
  const noteCommentRef = useRef(noteComment);
  useEffect(() => {
    noteCommentRef.current = noteComment;
  }, [noteComment]);

  // Реф для контроля асинхронного таймаута
  const selectionTimeoutRef = useRef(null);

  const openNoteModal = useCallback(() => {
    setIsNoteModalOpen(true);
    closeSelectionMenu();
  }, [closeSelectionMenu]);

  const closeNoteModal = useCallback(() => {
    setIsNoteModalOpen(false);
    setNoteComment("");

    if (selectionTimeoutRef.current) clearTimeout(selectionTimeoutRef.current);

    selectionTimeoutRef.current = setTimeout(() => {
      clearBrowserSelection();
    }, 50);
  }, [clearBrowserSelection]);

  // Гарантированно очищаем таймаут при размонтировании хука
  useEffect(() => {
    return () => {
      if (selectionTimeoutRef.current)
        clearTimeout(selectionTimeoutRef.current);
    };
  }, []);

  // Оптимизировано: handleSaveNote больше не зависит от частых рендеров стейта noteComment
  const handleSaveNote = useCallback(async () => {
    console.log(
      "%c💾 [API] Сохранение заметки в базу данных...",
      "color: #2e7d32; font-weight: bold;",
    );

    if (!token) {
      console.error("Ошибка сохранения заметки: отсутствует токен авторизации");
      return;
    }

    const notePayload = {
      bookId: Number(bookId),
      cfi: selectionMenu.cfi,
      selectedText: selectionMenu.text,
      userNote: noteCommentRef.current, // Берем свежее значение из рефа
      bookTitle: activeBook?.title || "Unknown Title",
      bookAuthor: activeBook?.author || "Unknown Author",
      createdAt: new Date().toISOString(),
    };

    try {
      await axios.post(
        "https://your-personal-bookshelf.onrender.com/api/v1/notes/create",
        notePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log(
        "%c✅ [API] Заметка успешно сохранена!",
        "color: #2e7d32; font-weight: bold;",
      );
      await fetchNotes(bookId);
      closeNoteModal();
    } catch (err) {
      console.error("Не удалось сохранить заметку:", err);
      handleRequestError(err, logout);
    }
  }, [
    bookId,
    selectionMenu,
    closeNoteModal,
    token,
    logout,
    activeBook,
    fetchNotes,
  ]);

  return {
    isNoteModalOpen,
    noteComment,
    setNoteComment,
    openNoteModal,
    closeNoteModal,
    handleSaveNote,
  };
};
