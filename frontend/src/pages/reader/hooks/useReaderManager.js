import { useState, useEffect, useRef, useCallback } from 'react';

export const useReaderManager = ({
    initialData,
    reportLiveProgress,
    totalSecondsSpent,
    startPage,
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

    // Флаг того, что экран и реальная точка чтения разошлись
    const [isDiverged, setIsDiverged] = useState(false);

    // ==========================================
    // ЛОГИ МОНТИРОВАНИЯ И ИЗМЕНЕНИЯ СОСТОЯНИЯ
    // ==========================================
    useEffect(() => {
        console.log("%c🟢 [ReaderInterface] Компонент смонтирован (Mounted)", "color: #28a745; font-weight: bold;");
        return () => {
            console.log("%c🔴 [ReaderInterface] КОМПОНЕНТ УНИЧТОЖЕН ИЗ DOM (Unmounted)!", "color: #dc3545; font-weight: bold;");
        };
    }, []);

    useEffect(() => {
        console.log(`%c🔄 [ReaderInterface State] Стейт isDiverged изменился на: ${isDiverged}`, "color: #ffc107; font-weight: bold;");
    }, [isDiverged]);
    // ==========================================

    // Объект для хранения истинной точки чтения (то, что улетит в базу)
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

    // Маркер источника перехода: 'normal' (кнопки листания) или 'jump' (оглавление/ссылки)
    const navigationSourceRef = useRef('normal');
    // Дубликат флага расхождения в ref, чтобы handleLocationChange видел его без перезапуска коллбека
    const isDivergedRef = useRef(false);

    // Дубликат навигации в ref, чтобы использовать свежие данные внутри useCallback
    const displayedNavRef = useRef(displayedNav);
    const initialProgressRef = useRef(initialData.progress || 0);

    useEffect(() => { displayedNavRef.current = displayedNav; }, [displayedNav]);

    const [isLiveProgress, setIsLiveProgress] = useState(false);
    // Реф для хранения самого актуального CFI страницы.
    const currentCfiRef = useRef(initialData.currentCfi || null);

    // ОБРАБОТЧИК СМЕНЫ СТРАНИЦ (для epub.js)
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

        console.log(`%c📱 [handleLocationChange] Сработал. Источник: "${navigationSourceRef.current}", Текущий isDivergedRef: ${isDivergedRef.current}`, "color: #17a2b8;");

        // Настраиваем таймер неактивности под новую страницу
        startPage(finalTimeLimit);

        // Просто сохраняем свежий CFI в реф
        currentCfiRef.current = cfi;

        if (percent !== 0) {
            setDisplayedProgress(percent);
            setIsLiveProgress(true);
        }

        if (isDivergedRef.current) {
            console.log("➡️ [handleLocationChange] Пропуск: расхождение уже зафиксировано (isDivergedRef.current === true)");
            return;
        }

        // ПРОВЕРКА: Если сработал переход, но это был НЕ клик по нижним кнопкам навигации
        if (navigationSourceRef.current !== 'normal') {
            console.log("⚠️ [handleLocationChange] Источник не 'normal'! Включаем расхождение (setIsDiverged(true))");
            setIsDiverged(true);
            isDivergedRef.current = true;
            return;
        }

        // Если это обычное листание — обновляем сохраненную точку чтения вслед за экраном
        console.log("✅ [handleLocationChange] Обычное листание. Синхронизируем точку savedLocation.");
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

    }, [startPage, initialData.progress]);

    // Синхронизация данных навигации из книги
    useEffect(() => {
        if (navigationData && navigationData.totalSections > 1) {
            console.log("📋 [useEpubReader Effect] Получены новые navigationData:", navigationData);
            setDisplayedNav(navigationData);
        }
    }, [navigationData]);

    // Обертки над стандартным перелистыванием страниц
    const handleNormalNext = () => {
        console.log("➡️ Вызвана handleNormalNext (Клик Вперед)");
        navigationSourceRef.current = 'normal'; // явно говорим, что это обычное листание
        handleNextPage();
    };

    const handleNormalPrev = () => {
        console.log("⬅️ Вызвана handleNormalPrev (Клик Назад)");
        navigationSourceRef.current = 'normal';
        handlePrevPage();
    };

    // Действие для кнопки "Вернуться к чтению"
    const handleReturnToReading = () => {
        console.log("🔄 Вызвана handleReturnToReading");
        navigationSourceRef.current = 'normal'; // возвращаем обычный режим
        setIsDiverged(false);
        isDivergedRef.current = false;
        handleTocNavigation(savedLocation.cfi); // даем команду epub.js прыгнуть на CFI закладки
    };

    // Действие для кнопки "Читать здесь" (сохранить точку)
    const handleConfirmReadingHere = () => {
        console.log("📌 Вызвана handleConfirmReadingHere");
        setSavedLocation({
            cfi: currentCfiRef.current,
            progress: displayedProgress,
            nav: { ...displayedNav }
        });
        navigationSourceRef.current = 'normal';

        setIsDiverged(false);
        isDivergedRef.current = false;
    };

    // Действие для клика по главе оглавления
    const handleJumpToChapter = (href) => {
        console.log(`%c🎯 [TocModal -> onNavigate] Клик по главе: ${href}`, "color: #dc3545; font-weight: bold;");

        // Если мы совершаем прыжок впервые, фиксируем текущее положение экрана как сохраненную точку
        if (!isDivergedRef.current) {
            console.log("🎯 [TocModal -> onNavigate] Фиксация начальной точки перед прыжком в savedLocation");
            setSavedLocation({
                cfi: currentCfiRef.current,
                progress: displayedProgress,
                nav: { ...displayedNav }
            });
        }

        // Переключаем маркеры в режим прыжка
        navigationSourceRef.current = 'jump';
        setIsDiverged(true);
        isDivergedRef.current = true;

        handleTocNavigation(href);
        setIsTocOpen(false);
    };

    // СИНХРОНИЗАТОР СОСТОЯНИЯ (Синхронизация с БД)
    useEffect(() => {
        if (loading) return;

        console.log(`%c✉️ [reportLiveProgress Effect] Срабатывание. Вызов reportLiveProgress. Текущий стейт isDiverged: ${isDiverged}`, "color: #6f42c1;");

        if (isDiverged) {
            reportLiveProgress({
                currentCfi: savedLocation.cfi,
                progress: savedLocation.progress,
                readingTime: totalSecondsSpent,
                currentSection: savedLocation.nav.currentSection,
                numberOfSections: savedLocation.nav.totalSections,
                currentChapterInSection: savedLocation.nav.currentChapter,
                numberOfChaptersInSection: savedLocation.nav.totalChapters
            });
        } else {
            // Если расхождений нет — отправляем живые координаты с экрана
            reportLiveProgress({
                currentCfi: currentCfiRef.current,
                progress: displayedProgress,
                readingTime: totalSecondsSpent,
                currentSection: displayedNav.currentSection,
                numberOfSections: displayedNav.totalSections,
                currentChapterInSection: displayedNav.currentChapter,
                numberOfChaptersInSection: displayedNav.totalChapters
            });
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