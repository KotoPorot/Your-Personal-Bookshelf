import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useBookProgress } from './hooks/useBookProgress';
import { useReadingTimer } from './hooks/useReadingTimer';
import { useEpubReader } from './hooks/useEpubReader';
import ReaderSidebar from './components/ReaderSidebar';
import BookViewer from './BookViewer';
import TocModal from './TocModal';
import './test.css';

// =========================================================================
// ПРАВИЛЬНО: ReaderInterface вынесен ОТДЕЛЬНО, наружу от основного экрана.
// Теперь тики таймера внутри него не будут уничтожать весь компонент!
// =========================================================================
const ReaderInterface = ({ bookId, onBack, initialData, saveProgress }) => {
    const viewerRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const [isTocOpen, setIsTocOpen] = useState(false);

    const {
        totalSecondsSpent,
        isIdle,
        startPage,
        resetIdle
    } = useReadingTimer(initialData.totalTimeSpent);

    const totalSecondsRef = useRef(totalSecondsSpent);
    useEffect(() => {
        totalSecondsRef.current = totalSecondsSpent;
    }, [totalSecondsSpent]);

    const handleLocationChange = useCallback(({ cfi, percent, charCount }) => {
        const CHARS_PER_SECOND = 15;
        const estimatedTime = (charCount / CHARS_PER_SECOND) + 5;
        const finalTimeLimit = Math.max(30, Math.round(estimatedTime));

        console.log(
                `%c[Epubjs -> Расчет Лимита]%c Текст отрисован. Символов на странице: %c${charCount}%c. Скорость чтения: ${CHARS_PER_SECOND} симв/сек. Выделено времени до проверки активности: %c${finalTimeLimit} сек.%c`,
                'color: #007bff; font-weight: bold;', 'color: inherit;',
                'color: #007bff; font-weight: bold;', 'color: inherit;',
                'color: #28a745; font-weight: bold; font-size: 11px;', 'color: inherit;'
            );

        startPage(finalTimeLimit);

        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveProgress(cfi, percent, totalSecondsRef.current);
        }, 2000);
    }, [saveProgress, startPage]);

    const {
        loading, error, navigationData, progressPercent, toc,
        handleTocNavigation, handlePrevPage, handleNextPage
    } = useEpubReader(bookId, viewerRef, initialData.currentCfi, handleLocationChange);


    return (
    <div className="reader-container">
        <ReaderSidebar
            onBack={onBack}
            onToggleToc={() => setIsTocOpen(!isTocOpen)}
            totalSecondsSpent={totalSecondsSpent}
            progressPercent={progressPercent}
            navigationData={navigationData}
        />

        {/* Убрали отсюда blur-mode, чтобы не ломать контекст окна */}
        <div className="reader-main" onClick={resetIdle}>

            {/* Обертка для книги, которая будет блюриться ОГРАНИЧЕННО */}
            <div className={`viewer-blur-container ${isIdle ? 'blur-mode' : ''}`} style={{ width: '100%', height: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <BookViewer
                    ref={viewerRef}
                    loading={loading}
                    error={error}
                    onPrev={handlePrevPage}
                    onNext={handleNextPage}
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
        </div>

        <TocModal
            isOpen={isTocOpen} onClose={() => setIsTocOpen(false)} toc={toc}
            currentSection={navigationData.currentSection} currentChapter={navigationData.currentChapter}
            onNavigate={(href) => { handleTocNavigation(href); setIsTocOpen(false); }}
        />
    </div>
);
};

// =========================================================================
// ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ (просто загружает данные и вызывает интерфейс)
// =========================================================================
const ReaderPage = ({ bookId, onBack }) => {
    const { initialData, loadingProgress, saveProgress } = useBookProgress(bookId);

    if (loadingProgress) {
        return <div className="reader-loading">Загрузка прогресса чтения...</div>;
    }

    return (
        <ReaderInterface
            bookId={bookId}
            onBack={onBack}
            initialData={initialData}
            saveProgress={saveProgress}
        />
    );
};

export default ReaderPage;