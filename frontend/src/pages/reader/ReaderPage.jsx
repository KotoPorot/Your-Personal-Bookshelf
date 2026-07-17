import React, { useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookNotesProvider } from '../../context/BookNotesContext';

import { useBookProgress } from './hooks/useBookProgress';
import { useReadingTimer } from './hooks/useReadingTimer';
import { useEpubReader } from './hooks/useEpubReader';
import { useReaderManager } from './hooks/useReaderManager';
import { useTextSelection } from './hooks/useTextSelection';
import { useBookNotesManager } from './hooks/useBookNotesManager';

import ReaderSidebar from './components/ReaderSidebar';
import ReaderBottomBar from './components/ReaderBottomBar';
import SelectionMenu from './components/SelectionMenu';
import CreateNoteModal from './components/CreateNoteModal';
import BookViewer from './components/BookViewer';
import TocModal from './components/TocModal';
import BookNotesModal from './components/BookNotesModal';
import NoteDetailModal from './components/NoteDetailModal';

import './ReaderPage.css';

// =========================================================================
// ИНТЕРФЕЙС ЧИТАЛКИ (внутренний компонент)
// =========================================================================
const ReaderInterface = ({ bookId, initialData, reportLiveProgress }) => {
    const { closeReader } = useAuth(); // <-- Достаем функцию закрытия читалки напрямую
    const viewerRef = useRef(null);
    const handleLocationChangeRef = useRef(null);

    // 1. ИНИЦИАЛИЗИРУЕМ ТАЙМЕР
    const {
        totalSecondsSpent,
        isIdle,
        startPage,
        resetIdle
    } = useReadingTimer(initialData.readingTime || 0);

    const textSelection = useTextSelection({ bookId });

    // Паттерн моста для обратного вызова из асинхронного EpubJS без нарушения порядка хуков
    const stableHandleLocationChange = useCallback((params) => {
        if (!params) return;

        // Если пришло событие выделения текста
        if (params.type === 'selection') {
            textSelection.handleTextSelected(params);
        }
        // Если пришел клик по тексту книги (скрываем контекстное меню)
        else if (params.type === 'click') {
            textSelection.closeSelectionMenu();
        }
        // В остальных случаях — это стандартное перелистывание страниц
        else if (handleLocationChangeRef.current) {
            handleLocationChangeRef.current(params);
        }
    }, [textSelection]);

    // 2. ПОДКЛЮЧАЕМ ЧИТАЛКУ EPUB
    const {
        loading, error, navigationData, progressPercent, toc,
        handleTocNavigation, handlePrevPage, handleNextPage
    } = useEpubReader(bookId, viewerRef, initialData.currentCfi, stableHandleLocationChange);

    // 3. ПОДКЛЮЧАЕМ ВЫДЕЛЕННЫЙ МЕНЕДЖЕР ЛОГИКИ ЧИТАЛКИ
    const manager = useReaderManager({
        initialData,
        reportLiveProgress,
        totalSecondsSpent,
        startPage,
        loading,
        navigationData,
        handleNextPage,
        handlePrevPage,
        handleTocNavigation
    });

    // Связываем мост с актуальной функцией менеджера
    handleLocationChangeRef.current = manager.handleLocationChange;

    // 4. ПОДКЛЮЧАЕМ ХУК УПРАВЛЕНИЯ ЗАМЕТКАМИ
     const notesManager = useBookNotesManager(bookId, manager.handleJumpToChapter);

    return (
        <div className="reader-container">
            <ReaderSidebar
                onBack={closeReader}
                onToggleToc={() => manager.setIsTocOpen(!manager.isTocOpen)}
                onToggleNotes={notesManager.handleToggleNotesList}
                totalSecondsSpent={totalSecondsSpent}
                progressPercent={manager.displayedProgress}
                navigationData={manager.displayedNav}
                isLiveProgress={manager.isLiveProgress}
            />

            <div className="reader-main" onClick={resetIdle}>
                {/* Обертка для книги, которая будет блюриться ОГРАНИЧЕННО */}
                <div className={`viewer-blur-container ${isIdle ? 'blur-mode' : ''}`} style={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <BookViewer
                        ref={viewerRef}
                        loading={loading}
                        error={error}
                        onPrev={manager.handleNormalPrev}
                        onNext={manager.handleNormalNext}
                    />
                </div>

                {/* Оверлей теперь лежит отдельно, он ВСЕГДА будет четким и поверх всего */}
                {isIdle && (
                    <div className="idle-overlay" style={{ zIndex: 100 }}>
                        <div className="idle-message">
                            <h4>Вы здесь?</h4>
                            <p>Кликните по экрану, чтобы продолжить чтение</p>
                        </div>
                    </div>
                )}

                <ReaderBottomBar
                    isDiverged={manager.isDiverged}
                    onReturnToReading={manager.handleReturnToReading}
                    onConfirmReadingHere={manager.handleConfirmReadingHere}
                />
            </div>

            <TocModal
                isOpen={manager.isTocOpen}
                onClose={() => manager.setIsTocOpen(false)}
                toc={toc}
                currentSection={manager.displayedNav.currentSection}
                currentChapter={manager.displayedNav.currentChapter}
                onNavigate={manager.handleJumpToChapter}
            />

            <SelectionMenu
                visible={textSelection.selectionMenu.visible}
                top={textSelection.selectionMenu.top}
                left={textSelection.selectionMenu.left}
                onCreateNote={textSelection.openNoteModal}
                onTranslate={() => alert('Функция перевода будет доступна позже!')}
            />

            {/* Модалка ввода текста заметки */}
            <CreateNoteModal
                isOpen={textSelection.isNoteModalOpen}
                onClose={textSelection.closeNoteModal}
                selectedText={textSelection.selectionMenu.text}
                noteComment={textSelection.noteComment}
                setNoteComment={textSelection.setNoteComment}
                onSave={textSelection.handleSaveNote}
            />
            <BookNotesModal
                isOpen={notesManager.isNotesListOpen}
                onClose={notesManager.handleCloseNotesList}
                notes={notesManager.bookNotes}
                loading={notesManager.loadingNotes}
                onNoteClick={notesManager.setActiveDetailNote}
                activeNoteId={notesManager.activeDetailNote?.noteId}
            />
            <NoteDetailModal
                isOpen={!!notesManager.activeDetailNote}
                onClose={notesManager.handleCloseDetailNote}
                note={notesManager.activeDetailNote}
                onNavigate={notesManager.handleJumpToNote}
                onDelete={notesManager.handleDeleteNote}
            />
        </div>
    );
};

// =========================================================================
// ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ (просто загружает данные и вызывает интерфейс)
// =========================================================================
const ReaderPage = () => {
    // Достаем активную книгу из контекста авторизации
    const { activeBook } = useAuth();

    // Если по какой-то причине книги нет в стейте (например, прямой переход по ссылке),
    // берем ID из localStorage в качестве фоллбека, либо выводим заглушку.
    const bookId = activeBook?.id || JSON.parse(localStorage.getItem('activeBook'))?.id;

    const { initialData, loadingProgress, reportLiveProgress } = useBookProgress(bookId);

    console.log(`%c⏳ [ReaderPage Render] loadingProgress: ${loadingProgress}`, "color: #6c757d;");

    if (!bookId) {
        return <div className="reader-loading">Книга не выбрана...</div>;
    }

    if (loadingProgress) {
        console.log("%c⏳ [ReaderPage] Возврат экрана загрузки...", "color: #6c757d;");
        return <div className="reader-loading">Загрузка прогресса чтения...</div>;
    }

    return (
        <BookNotesProvider>
        <ReaderInterface
            bookId={bookId}
            initialData={initialData}
            reportLiveProgress={reportLiveProgress}
        />
        </BookNotesProvider>

    );
};

export default ReaderPage;