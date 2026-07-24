import React from "react";
import { useAuth } from "../../context/AuthContext";
import { BookNotesProvider } from "../../context/BookNotesContext";

// Импортируем созданный контекст фичи
import { ReaderProvider, useReader } from "./context/ReaderContext";

import { useBookProgress } from "./hooks/progress/useBookProgress";

import ReaderSidebar from "./components/ReaderSidebar";
import ReaderBottomBar from "./components/ReaderBottomBar";
import SelectionMenu from "./components/SelectionMenu";
import CreateNoteModal from "./components/CreateNoteModal";
import BookViewer from "./components/BookViewer";
import TocModal from "./components/TocModal";
import BookNotesModal from "./components/BookNotesModal";
import NoteDetailModal from "./components/NoteDetailModal";

import "./ReaderPage.css";

// =========================================================================
// ИНТЕРФЕЙС ЧИТАЛКИ (внутренний компонент)
// =========================================================================
const ReaderInterface = () => {
  // Достаем абсолютно всё управление из локального контекста фичи
  const { viewerRef, state, actions } = useReader();

  return (
    <div className="reader-container">
      {/* Панель полностью автономна и берет данные напрямую из useReader */}
      <ReaderSidebar />

      <div className="reader-main" onClick={actions.resetIdle}>
        {/* Обертка для книги, которая будет блюриться ОГРАНИЧЕННО */}
        <div
          className={`viewer-blur-container ${state.isIdle ? "blur-mode" : ""}`}
          style={{
            width: "100%",
            height: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <BookViewer
            ref={viewerRef}
            loading={state.loading}
            error={state.error}
            onPrev={actions.handleNormalPrev}
            onNext={actions.handleNormalNext}
          />
        </div>

        {/* Оверлей простоя */}
        {state.isIdle && (
          <div className="idle-overlay" style={{ zIndex: 100 }}>
            <div className="idle-message">
              <h4>Вы здесь?</h4>
              <p>Кликните по экрану, чтобы продолжить чтение</p>
            </div>
          </div>
        )}

        {/* Панель возврата позиции тоже отвязана от пропсов */}
        <ReaderBottomBar />
      </div>

      <TocModal />
      <SelectionMenu />
      <CreateNoteModal />
      <BookNotesModal />
      <NoteDetailModal />
    </div>
  );
};

// =========================================================================
// ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ
// =========================================================================
const ReaderPage = () => {
  const { activeBook } = useAuth();
  const bookId =
    activeBook?.id || JSON.parse(localStorage.getItem("activeBook"))?.id;

  const { initialData, loadingProgress, reportLiveProgress } =
    useBookProgress(bookId);

  if (!bookId) {
    return <div className="reader-loading">Книга не выбрана...</div>;
  }

  if (loadingProgress) {
    return <div className="reader-loading">Загрузка прогресса чтения...</div>;
  }

  return (
    <BookNotesProvider>
      <ReaderProvider
        bookId={bookId}
        initialData={initialData}
        reportLiveProgress={reportLiveProgress}
      >
        <ReaderInterface />
      </ReaderProvider>
    </BookNotesProvider>
  );
};

export default ReaderPage;
