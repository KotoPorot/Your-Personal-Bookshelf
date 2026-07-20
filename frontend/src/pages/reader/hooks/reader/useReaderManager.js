import { useState, useEffect, useRef, useCallback } from 'react';

export const useReaderManager = ({
    initialData,
    reportLiveProgress,
    totalSecondsSpent,
    startPage, // Теперь стабильно контролируется в зависимостях
    loading,
    navigationData,
    handleNextPage,
    handlePrevPage,
    handleTocNavigation
}) => {
    const [isTocOpen, setIsTocOpen] = useState(false);
    const [displayedProgress, setDisplayedProgress] = useState(initialData.progress || 0);

    const [displayedNav, setDisplayedNav] = useState({
        currentSection: initialData.currentSection || 1,
        totalSections: initialData.numberOfSections || 1,
        currentChapter: initialData.currentChapterInSection || 1,
        totalChapters: initialData.numberOfChaptersInSection || 1
    });

    const [isDiverged, setIsDiverged] = useState(false);

    // Логи жизненного цикла
    useEffect(() => {
        console.log("%c🟢 [ReaderInterface] Компонент смонтирован (Mounted)", "color: #28a745; font-weight: bold;");
        return () => {
            console.log("%c🔴 [ReaderInterface] КОМПОНЕНТ УНИЧТОЖЕН ИЗ DOM (Unmounted)!", "color: #dc3545; font-weight: bold;");
        };
    }, []);

    useEffect(() => {
        console.log(`%c🔄 [ReaderInterface State] Стейт isDiverged изменился на: ${isDiverged}`, "color: #ffc107; font-weight: bold;");
    }, [isDiverged]);

    const [savedLocation, setSavedLocation] = useState({
        cfi: initialData.currentCfi || null,
        progress: initialData.progress || 0,
        nav: {
            currentSection: initialData.currentSection || 1,
            totalSections: initialData.numberOfSections || 1,
            currentChapter: initialData.currentChapterInSection || 1,
            totalChapters: initialData.numberOfChaptersInSection || 1
        }
    });

    const navigationSourceRef = useRef('normal');
    const isDivergedRef = useRef(false);
    const displayedNavRef = useRef(displayedNav);

    useEffect(() => { displayedNavRef.current = displayedNav; }, [displayedNav]);

    const [isLiveProgress, setIsLiveProgress] = useState(false);
    const currentCfiRef = useRef(initialData.currentCfi || null);

    const lastReportedTimeRef = useRef(0);
    const lastReportedCfiRef = useRef(null);
    const lastReportedDivergedRef = useRef(false);

    // ОБРАБОТЧИК СМЕНЫ СТРАНИЦ
    const handleLocationChange = useCallback(({ cfi, percent, charCount }) => {
        const CHARS_PER_SECOND = 15;
        const estimatedTime = (charCount / CHARS_PER_SECOND) + 5;
        const finalTimeLimit = Math.max(30, Math.round(estimatedTime));

        console.log(
            `%c[Epubjs -> Расчет Лимита]%c Текст отрисован. Символов на странице: %c${charCount}%c. Скорость чтения: ${CHARS_PER_SECOND} симв/сек. Выделено времени до проверки активности: %c${finalTimeLimit} ...`,
            'color: #007bff; font-weight: bold;', 'color: inherit;',
            'color: #007bff; font-weight: bold;', 'color: inherit;',
            'color: #28a745; font-weight: bold; font-size: 11px;', 'color: inherit;'
        );

        // Исправлено: теперь startPage корректно находится в замыкании
        startPage(finalTimeLimit);
        currentCfiRef.current = cfi;

        if (percent !== 0) {
            setDisplayedProgress(percent);
            setIsLiveProgress(true);
        }

        if (isDivergedRef.current) {
            return;
        }

        if (navigationSourceRef.current !== 'normal') {
            setIsDiverged(true);
            isDivergedRef.current = true;
            return;
        }

        setSavedLocation({
            cfi: cfi,
            progress: percent,
            nav: {
                currentSection: displayedNavRef.current.currentSection,
                totalSections: displayedNavRef.current.totalSections,
                currentChapter: displayedNavRef.current.currentChapter,
                totalChapters: displayedNavRef.current.totalChapters
            }
        });

    }, [startPage]);

    // Синхронизация данных навигации
    useEffect(() => {
        if (navigationData && navigationData.totalSections > 1) {
            setDisplayedNav(navigationData);
        }
    }, [navigationData]);

    const handleNormalNext = () => {
        navigationSourceRef.current = 'normal';
        handleNextPage();
    };

    const handleNormalPrev = () => {
        navigationSourceRef.current = 'normal';
        handlePrevPage();
    };

    const handleReturnToReading = () => {
        navigationSourceRef.current = 'normal';
        setIsDiverged(false);
        isDivergedRef.current = false;
        handleTocNavigation(savedLocation.cfi);
    };

    const handleConfirmReadingHere = () => {
        setSavedLocation({
            cfi: currentCfiRef.current,
            progress: displayedProgress,
            nav: { ...displayedNav }
        });
        navigationSourceRef.current = 'normal';
        setIsDiverged(false);
        isDivergedRef.current = false;
    };

    const handleJumpToChapter = (href) => {
        if (!isDivergedRef.current) {
            setSavedLocation({
                cfi: currentCfiRef.current,
                progress: displayedProgress,
                nav: { ...displayedNav }
            });
        }

        navigationSourceRef.current = 'jump';
        setIsDiverged(true);
        isDivergedRef.current = true;

        handleTocNavigation(href);
        setIsTocOpen(false);
    };

    // ОПТИМИЗИРОВАННЫЙ СИНХРОНИЗАТОР С БЭКЕНДОМ
    useEffect(() => {
        if (loading) return;

        const timePassed = totalSecondsSpent - lastReportedTimeRef.current;
        const cfiChanged = currentCfiRef.current !== lastReportedCfiRef.current;
        const divergedChanged = isDiverged !== lastReportedDivergedRef.current;

        if (cfiChanged || divergedChanged || timePassed >= 15) {
            const payload = isDiverged ? {
                currentCfi: savedLocation.cfi,
                progress: savedLocation.progress,
                readingTime: totalSecondsSpent,
                currentSection: savedLocation.nav.currentSection,
                numberOfSections: savedLocation.nav.totalSections,
                currentChapterInSection: savedLocation.nav.currentChapter,
                numberOfChaptersInSection: savedLocation.nav.totalChapters
            } : {
                currentCfi: currentCfiRef.current,
                progress: displayedProgress,
                readingTime: totalSecondsSpent,
                currentSection: displayedNav.currentSection,
                numberOfSections: displayedNav.totalSections,
                currentChapterInSection: displayedNav.currentChapter,
                numberOfChaptersInSection: displayedNav.totalChapters
            };

            console.log(`%c✉️ [reportLiveProgress] Отправка данных на сервер... Секунд прочитано: ${totalSecondsSpent}`, "color: #6f42c1; font-weight: bold;");
            reportLiveProgress(payload);

            lastReportedTimeRef.current = totalSecondsSpent;
            lastReportedCfiRef.current = currentCfiRef.current;
            lastReportedDivergedRef.current = isDiverged;
        }
    }, [totalSecondsSpent, displayedProgress, displayedNav, isDiverged, savedLocation, reportLiveProgress, loading]);

    return {
        isTocOpen,
        setIsTocOpen,
        displayedProgress,
        displayedNav,
        isDiverged,
        isLiveProgress,
        handleLocationChange,
        handleNormalNext,
        handleNormalPrev,
        handleReturnToReading,
        handleConfirmReadingHere,
        handleJumpToChapter
    };
};