import { useState, useEffect, useRef, useCallback } from 'react';
import ePub from 'epubjs';

export const useEpubReader = (bookId, viewerRef, initialCfi, onLocationChange) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [navigationData, setNavigationData] = useState({
        currentSection: 1, totalSections: 1, currentChapter: 1, totalChapters: 1,
    });
    const [progressPercent, setProgressPercent] = useState(0);
    const [toc, setToc] = useState([]);

    const bookRef = useRef(null);
    const renditionRef = useRef(null);
    const sectionsRef = useRef([]);
    const isInitializing = useRef(false);

    // Реф для жесткой блокировки таймеров и прогресса до полной отрисовки текста
    const isBookReadyRef = useRef(false);

    const onLocationChangeRef = useRef(onLocationChange);
    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
    }, [onLocationChange]);

    const updateNavigationProgress = (location) => {
        if (!bookRef.current || !location) return 0;
        try {
            const spineIndex = location.start?.index || 0;
            let currentPercent = 0;
            if (bookRef.current.locations?.percentageFromCfi) {
                currentPercent = bookRef.current.locations.percentageFromCfi(location.start.cfi) || 0;
                setProgressPercent(currentPercent);
            }

            const sections = sectionsRef.current;
            if (sections.length > 0) {
                let secIdx = sections.findIndex(s => spineIndex >= s.startIndex && spineIndex <= s.endIndex);
                if (secIdx === -1) secIdx = spineIndex < sections[0].startIndex ? 0 : sections.length - 1;

                const activeSection = sections[secIdx];
                setNavigationData({
                    currentSection: secIdx + 1,
                    totalSections: sections.length,
                    currentChapter: spineIndex - activeSection.startIndex + 1,
                    totalChapters: activeSection.endIndex - activeSection.startIndex + 1
                });
            }
            return currentPercent;
        } catch (e) {
            return 0;
        }
    };

    useEffect(() => {
        let isMounted = true;
        if (!viewerRef.current || bookRef.current || isInitializing.current) return;

        const loadBook = async () => {
            try {
                isInitializing.current = true;
                setLoading(true);
                isBookReadyRef.current = false;

                const token = localStorage.getItem('token');
                if (!token) throw new Error('Нет токена');

                const response = await fetch(`http://localhost:8080/api/v1/books/getBook/${bookId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Ошибка сети');
                const arrayBuffer = await response.arrayBuffer();

                if (!isMounted) return;

                const book = ePub();
                bookRef.current = book;
                await book.open(arrayBuffer);

                if (!isMounted) return;

                book.loaded.navigation.then((nav) => {
                    if (!isMounted || !nav?.toc) return;
                    const processed = nav.toc.map(item => ({
                        label: item.label,
                        href: item.href,
                        startIndex: book.spine.get(item.href)?.index || 0
                    })).sort((a, b) => a.startIndex - b.startIndex);

                    for (let i = 0; i < processed.length; i++) {
                        processed[i].endIndex = processed[i + 1] ? processed[i + 1].startIndex - 1 : book.spine.length - 1;
                        processed[i].chapters = Array.from({ length: processed[i].endIndex - processed[i].startIndex + 1 }, (_, j) => ({
                            chapterNum: j + 1,
                            label: `Глава ${j + 1}`,
                            href: book.spine.items[processed[i].startIndex + j]?.href || processed[i].href
                        }));
                    }
                    sectionsRef.current = processed;
                    setToc(processed);
                });

                const rendition = book.renderTo(viewerRef.current, {
                    width: '100%', height: '100%', flow: 'paginated', manager: 'default', allowScriptedContent: true
                });
                renditionRef.current = rendition;

                rendition.on('relocated', (location) => {
                    if (!isMounted) return;
                    const calculatedPercent = updateNavigationProgress(location);

                    // Если книга не до конца стабилизировалась в DOM, не шлем ничего в таймеры родителя
                    if (!isBookReadyRef.current) return;

                    let charCount = 0;
                    try {
                        renditionRef.current.getContents().forEach(content => {
                            charCount += content?.document?.body?.innerText?.length || 0;
                        });
                    } catch (err) { }

                    const displayed = location.end?.displayed || location.start?.displayed;
                    if (displayed?.total > 0) {
                        charCount = Math.round(charCount / displayed.total);
                    } else if (charCount > 2500) {
                        charCount = 1300;
                    }

                    if (onLocationChangeRef.current) {
                        onLocationChangeRef.current({
                            cfi: location.start.cfi,
                            percent: calculatedPercent,
                            charCount
                        });
                    }
                });

                const startDisplay = async () => {
                    try {
                        if (initialCfi && initialCfi !== 'undefined') {
                            await rendition.display(initialCfi);
                        } else {
                            await rendition.display();
                        }
                    } catch (cfiError) {
                        console.warn("Мягкий откат CFI:", cfiError);
                        try {
                            const baseCfi = initialCfi && initialCfi.includes('!')
                                ? initialCfi.split('!')[0] + '!)'
                                : initialCfi;
                            await rendition.display(baseCfi);
                        } catch (fallbackError) {
                            await rendition.display();
                        }
                    } finally {
                        if (isMounted) {
                            // 1. Выключаем экран загрузки. Контейнер книги в DOM теперь СТАБИЛЕН и имеет 100% ширины
                            setLoading(false);
                            isBookReadyRef.current = true;

                            // 2. Даем React 200мс на то, чтобы полностью завершить рендеринг стилей и убрать лоадер
                            setTimeout(() => {
                                if (!isMounted || !renditionRef.current) return;
                                try {
                                    // Корректируем внутренние размеры epub.js под реальный открывшийся DOM
                                    renditionRef.current.resize();

                                    // === КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Насильно перерисовываем текущую страницу ===
                                    // Это заставит epub.js пересчитать текст под новые недеформированные размеры контейнера
                                    const currentLoc = renditionRef.current.currentLocation?.();
                                    if (currentLoc?.start?.cfi) {
                                        renditionRef.current.display(currentLoc.start.cfi).then(() => {
                                            // Только ПОСЛЕ успешной перерисовки текста инициализируем первый тик таймера
                                            let charCount = 0;
                                            try {
                                                renditionRef.current.getContents().forEach(content => {
                                                    charCount += content?.document?.body?.innerText?.length || 0;
                                                });
                                            } catch (err) {}

                                            const displayed = currentLoc.end?.displayed || currentLoc.start?.displayed;
                                            if (displayed?.total > 0) {
                                                charCount = Math.round(charCount / displayed.total);
                                            } else if (charCount > 2500) {
                                                charCount = 1300;
                                            }

                                            const currentPercent = bookRef.current?.locations?.percentageFromCfi?.(currentLoc.start.cfi) || 0;

                                            if (onLocationChangeRef.current) {
                                                onLocationChangeRef.current({
                                                    cfi: currentLoc.start.cfi,
                                                    percent: currentPercent,
                                                    charCount
                                                });
                                            }
                                        });
                                    }
                                } catch (e) {
                                    console.error("Ошибка принудительного пробуждения книги:", e);
                                }
                            }, 200);
                        }
                    }
                };

                startDisplay();

                book.ready.then(async () => {
                    if (!isMounted) return;
                    try {
                        await book.locations.generate(1000);
                        const currentLoc = renditionRef.current?.currentLocation?.();
                        if (currentLoc && isMounted) {
                            setProgressPercent(book.locations.percentageFromCfi(currentLoc.start.cfi) || 0);
                        }
                    } catch (e) { }
                });

            } catch (err) {
                if (isMounted) {
                    setError('Ошибка при загрузке книги');
                    setLoading(false);
                }
            } finally {
                isInitializing.current = false;
            }
        };

        loadBook();

        return () => {
            isMounted = false;
            if (renditionRef.current) renditionRef.current.destroy();
            if (bookRef.current) bookRef.current.destroy();
        };
    }, [bookId]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') renditionRef.current?.prev();
            if (e.key === 'ArrowRight') renditionRef.current?.next();
        };
        const handleResize = () => renditionRef.current?.manager && renditionRef.current.resize();

        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleTocNavigation = useCallback((href) => renditionRef.current?.display(href), []);
    const handlePrevPage = useCallback(() => renditionRef.current?.prev(), []);
    const handleNextPage = useCallback(() => renditionRef.current?.next(), []);

    return {
        loading, error, navigationData, progressPercent, toc,
        handleTocNavigation, handlePrevPage, handleNextPage
    };
};