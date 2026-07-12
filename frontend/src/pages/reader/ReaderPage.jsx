import React, { useRef, useCallback } from 'react';
import { useBookProgress } from './hooks/useBookProgress';
import { useReadingTimer } from './hooks/useReadingTimer';
import { useEpubReader } from './hooks/useEpubReader';
import { useReaderManager } from './hooks/useReaderManager'; // Импортируем наш хук

import ReaderSidebar from './components/ReaderSidebar';
import ReaderBottomBar from './components/ReaderBottomBar';
import BookViewer from './BookViewer';
import TocModal from './TocModal';
import './test.css';

const ReaderInterface = ({ bookId, onBack, initialData, reportLiveProgress }) => {
    const viewerRef = useRef(null);

    // 1. ИНИЦИАЛИЗИРУЕМ ТАЙМЕР
    const {
        totalSecondsSpent,
        isIdle,
        startPage,
        resetIdle
    } = useReadingTimer(initialData.readingTime || 0);

    // Паттерн моста для обратного вызова из асинхронного EpubJS без нарушения порядка хуков
    const handleLocationChangeRef = useRef(null);
    const stableHandleLocationChange = useCallback((params) => {
        if (handleLocationChangeRef.current) {
            handleLocationChangeRef.current(params);
        }
    }, []);

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

    return (
        <div className="reader-container">
            <ReaderSidebar
                onBack={onBack}
                onToggleToc={() => manager.setIsTocOpen(!manager.isTocOpen)}
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
        </div>
    );
};

// =========================================================================
// ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ (просто загружает данные и вызывает интерфейс)
// =========================================================================
const ReaderPage = ({ bookId, onBack }) => {
    const { initialData, loadingProgress, reportLiveProgress } = useBookProgress(bookId);

    console.log(`%c⏳ [ReaderPage Render] loadingProgress: ${loadingProgress}`, "color: #6c757d;");

    if (loadingProgress) {
        console.log("%c⏳ [ReaderPage] Возврат экрана загрузки...", "color: #6c757d;");
        return <div className="reader-loading">Загрузка прогресса чтения...</div>;
    }

    return (
        <ReaderInterface
            bookId={bookId}
            onBack={onBack}
            initialData={initialData}
            reportLiveProgress={reportLiveProgress}
        />
    );
};

export default ReaderPage;