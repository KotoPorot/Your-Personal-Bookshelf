// src/pages/reader/context/ReaderContext.jsx
import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "../../../context/AuthContext";

import { useReadingTimer } from "../hooks/progress/useReadingTimer";
import { useTextSelection } from "../hooks/text_selection/useTextSelection";
import { useNoteCreate } from "../hooks/notes/useNoteCreate";
import { useBookNotesManager } from "../hooks/notes/useBookNotesManager";
import { useEpubReader } from "../hooks/reader/useEpubReader";
import { useReaderManager } from "../hooks/reader/useReaderManager";

const ReaderContext = createContext(null);

export const ReaderProvider = ({
  bookId,
  initialData,
  reportLiveProgress,
  children,
}) => {
  const { closeReader } = useAuth();
  const viewerRef = useRef(null);

  // Единая шина (рефы) для обхода круговой зависимости между хуками
  const handleLocationChangeRef = useRef(null);
  const handleJumpToChapterRef = useRef(null);

  // Стабильная обертка для прыжка по главам
  const stableHandleJumpToChapter = useCallback((href) => {
    if (handleJumpToChapterRef.current) {
      handleJumpToChapterRef.current(href);
    }
  }, []);

  // 1. Инициализируем таймер
  const { totalSecondsSpent, isIdle, startPage, resetIdle } = useReadingTimer(
    initialData.readingTime || 0,
  );

  // 2. Подключаем менеджер заметок
  const {
    isNotesListOpen,
    loadingNotes,
    bookNotes,
    activeDetailNote,
    handleToggleNotesList,
    handleCloseNotesList,
    handleCloseDetailNote,
    handleJumpToNote,
    handleDeleteNote,
    setActiveDetailNote,
  } = useBookNotesManager(bookId, stableHandleJumpToChapter);

  // 3. Хук выделения текста
  const {
    selectionMenu,
    handleTextSelected,
    closeSelectionMenu,
    clearBrowserSelection,
  } = useTextSelection({ viewerRef });

  // 4. Хук создания заметок
  const {
    isNoteModalOpen,
    noteComment,
    setNoteComment,
    openNoteModal,
    closeNoteModal,
    handleSaveNote,
  } = useNoteCreate({
    bookId,
    selectionMenu,
    closeSelectionMenu,
    clearBrowserSelection,
  });

  // 5. Архитектурный мост для разрыва цикличных обновлений
  const stableHandleLocationChange = useCallback(
    (params) => {
      if (!params) return;

      if (params.type === "selection") {
        handleTextSelected(params);
      } else if (params.type === "click") {
        closeSelectionMenu();
      } else if (handleLocationChangeRef.current) {
        handleLocationChangeRef.current(params);
      }
    },
    [handleTextSelected, closeSelectionMenu],
  );

  // 6. Инициализируем ядро Epub
  const epub = useEpubReader(
    bookId,
    viewerRef,
    initialData.currentCfi,
    stableHandleLocationChange,
    setActiveDetailNote,
    bookNotes,
  );

  // 7. Инициализируем главный менеджер синхронизации
  const manager = useReaderManager({
    initialData,
    reportLiveProgress,
    totalSecondsSpent,
    startPage,
    loading: epub.loading,
    navigationData: epub.navigationData,
    handleNextPage: epub.handleNextPage,
    handlePrevPage: epub.handlePrevPage,
    handleTocNavigation: epub.handleTocNavigation,
  });

  // Связываем мост с актуальными функциями менеджера
  handleLocationChangeRef.current = manager.handleLocationChange;
  handleJumpToChapterRef.current = manager.handleJumpToChapter;

  // СТАБИЛИЗАЦИЯ ДАННЫХ: Кэшируем вычисляемый объект провайдера.
  // Теперь компоненты будут обновляться только тогда, когда реально изменились нужные стейты,
  // а не при каждом случайном рендере родителя.
  const contextValue = useMemo(
    () => ({
      viewerRef,
      state: {
        isIdle,
        totalSecondsSpent,
        loading: epub.loading,
        error: epub.error,
        toc: epub.toc,
        selectionMenu,
        isNoteModalOpen,
        noteComment,

        isTocOpen: manager.isTocOpen,
        displayedProgress: manager.displayedProgress,
        displayedNav: manager.displayedNav,
        isDiverged: manager.isDiverged,
        isLiveProgress: manager.isLiveProgress,

        isNotesListOpen,
        bookNotes,
        loadingNotes,
        activeDetailNote,
      },
      actions: {
        closeReader,
        resetIdle,
        openNoteModal,
        closeNoteModal,
        setNoteComment,
        handleSaveNote,

        setIsTocOpen: manager.setIsTocOpen,
        handleNormalNext: manager.handleNormalNext,
        handleNormalPrev: manager.handleNormalPrev,
        handleReturnToReading: manager.handleReturnToReading,
        handleConfirmReadingHere: manager.handleConfirmReadingHere,
        handleJumpToChapter: manager.handleJumpToChapter,

        closeSelectionMenu,
        clearBrowserSelection,

        handleToggleNotesList,
        handleCloseNotesList,
        handleCloseDetailNote,
        handleJumpToNote,
        handleDeleteNote,
        setActiveDetailNote,
      },
    }),
    [
      isIdle,
      totalSecondsSpent,
      epub.loading,
      epub.error,
      epub.toc,
      selectionMenu,
      isNoteModalOpen,
      noteComment,
      manager.isTocOpen,
      manager.displayedProgress,
      manager.displayedNav,
      manager.isDiverged,
      manager.isLiveProgress,
      isNotesListOpen,
      bookNotes,
      loadingNotes,
      activeDetailNote,
      closeReader,
      resetIdle,
      openNoteModal,
      closeNoteModal,
      setNoteComment,
      handleSaveNote,
      closeSelectionMenu,
      clearBrowserSelection,
      manager.setIsTocOpen,
      manager.handleNormalNext,
      manager.handleNormalPrev,
      manager.handleReturnToReading,
      manager.handleConfirmReadingHere,
      manager.handleJumpToChapter,
      handleToggleNotesList,
      handleCloseNotesList,
      handleCloseDetailNote,
      handleJumpToNote,
      handleDeleteNote,
      setActiveDetailNote,
    ],
  );

  return (
    <ReaderContext.Provider value={contextValue}>
      {children}
    </ReaderContext.Provider>
  );
};

export const useReader = () => {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error("useReader должен использоваться внутри ReaderProvider");
  }
  return context;
};
