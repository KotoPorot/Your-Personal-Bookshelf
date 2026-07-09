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
const ReaderInterface = ({ bookId, onBack, initialData, reportLiveProgress }) => {
    const viewerRef = useRef(null);
    const [isTocOpen, setIsTocOpen] = useState(false);

    // 1. ИНИЦИАЛИЗИРУЕМ ТАЙМЕР
    // Вместо старого initialData.totalTimeSpent используем имя поля из бэка: readingTime
    const {
        totalSecondsSpent,
        isIdle,
        startPage,
        resetIdle
    } = useReadingTimer(initialData.readingTime || 0);

    // Реф для хранения самого актуального CFI страницы.
    // Изменение рефа не вызывает перерендер компонента, что экономит кучу ресурсов.
    const currentCfiRef = useRef(initialData.currentCfi || null);


    // 2. ОБРАБОТЧИК СМЕНЫ СТРАНИЦ (для epub.js)
    // Мы полностью убрали отсюда clearTimeout и setTimeout!
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

        // Настраиваем таймер неактивности под новую страницу
        startPage(finalTimeLimit);

        // Просто сохраняем свежий CFI в реф
        currentCfiRef.current = cfi;
    }, [startPage]);


    // 3. ПОДКЛЮЧАЕМ ЧИТАЛКУ EPUB
    // Передаем ей наш обновленный и стабильный handleLocationChange
    const {
        loading, error, navigationData, progressPercent, toc,
        handleTocNavigation, handlePrevPage, handleNextPage
    } = useEpubReader(bookId, viewerRef, initialData.currentCfi, handleLocationChange);


    // 4. СИНХРОНИЗАТОР СОСТОЯНИЯ (Ключевое изменение)
    // Каждый раз, когда тикает секунда времени (totalSecondsSpent) или меняется страница,
    // этот эффект мгновенно «сливает» актуальный объект в хук useBookProgress.
    // Так как reportLiveProgress внутри себя просто перезаписывает useRef,
    // этот эффект НЕ вызывает повторных рендеров интерфейса! Логика работает бесшумно.
    useEffect(() => {
        reportLiveProgress({
            currentCfi: currentCfiRef.current,
            progress: progressPercent,
            readingTime: totalSecondsSpent,
            currentSection: navigationData.currentSection,
            numberOfSections: navigationData.totalSections,        // Маппинг total -> numberOf
            currentChapterInSection: navigationData.currentChapter, // Маппинг под бэк
            numberOfChaptersInSection: navigationData.totalChapters // Маппинг total -> numberOfChapters
        });
    }, [totalSecondsSpent, progressPercent, navigationData, reportLiveProgress]);


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
    const { initialData, loadingProgress, reportLiveProgress } = useBookProgress(bookId);

    if (loadingProgress) {
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