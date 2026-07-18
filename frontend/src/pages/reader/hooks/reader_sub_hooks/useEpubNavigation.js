// src/pages/reader/hooks/sub-hooks/useEpubNavigation.js
import { useState, useEffect, useRef, useCallback } from 'react';

export const useEpubNavigation = (bookRef, renditionRef, isBookReadyRef, bookLoaded, initialCfi, onLocationChangeRef, setLoader, syncNotesAnnotationsRef) => {
    const [toc, setToc] = useState([]);
    const [progressPercent, setProgressPercent] = useState(0);
    const [navigationData, setNavigationData] = useState({
        currentSection: 1, totalSections: 1, currentChapter: 1, totalChapters: 1,
    });

    const sectionsRef = useRef([]);
    const hasBoundEventsRef = useRef(false);

    const updateNavigationProgress = useCallback((location) => {
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
    }, [bookRef]);

    const handleRelocated = useCallback((location) => {
        const calculatedPercent = updateNavigationProgress(location);

        if (syncNotesAnnotationsRef.current) {
            syncNotesAnnotationsRef.current();
        }

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
    }, [renditionRef, isBookReadyRef, onLocationChangeRef, updateNavigationProgress, syncNotesAnnotationsRef]);

    useEffect(() => {
        // Заходим сюда строго тогда, когда загрузчик дал отмашку (bookLoaded === true)
        if (!bookLoaded || !bookRef.current || !renditionRef.current || hasBoundEventsRef.current) return;
        hasBoundEventsRef.current = true;

        let isMounted = true;
        const rendition = renditionRef.current;
        const book = bookRef.current;

        // Регистрируем хуки контента до вызова дисплея текста
        rendition.hooks.content.register(() => {
            setTimeout(() => {
                if (syncNotesAnnotationsRef.current) {
                    syncNotesAnnotationsRef.current(true); // Мгновенный форсированный рендер при первой посадке DOM
                }
            }, 50);
        });

        rendition.on('relocated', handleRelocated);

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

        const startDisplay = async () => {
            try {
                if (initialCfi && initialCfi !== 'undefined') {
                    await rendition.display(initialCfi);
                } else {
                    await rendition.display();
                }
            } catch (cfiError) {
                try {
                    const baseCfi = initialCfi && initialCfi.includes('!') ? initialCfi.split('!')[0] + '!)' : initialCfi;
                    await rendition.display(baseCfi);
                } catch {
                    await rendition.display();
                }
            } finally {
                if (isMounted) {
                    isBookReadyRef.current = true;
                    setLoader(false); // Снимаем экран загрузки — дедлок устранен!

                    setTimeout(() => {
                        if (!isMounted || !renditionRef.current) return;
                        renditionRef.current.resize();
                        const currentLoc = renditionRef.current.currentLocation?.();
                        if (currentLoc) handleRelocated(currentLoc);
                    }, 150);
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

        return () => {
            isMounted = false;
            if (rendition) rendition.off('relocated', handleRelocated);
        };
    }, [bookLoaded, bookRef, renditionRef, initialCfi, isBookReadyRef, setLoader, handleRelocated, syncNotesAnnotationsRef]);

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
    }, [renditionRef]);

    const handleTocNavigation = useCallback((href) => renditionRef.current?.display(href), [renditionRef]);
    const handlePrevPage = useCallback(() => renditionRef.current?.prev(), [renditionRef]);
    const handleNextPage = useCallback(() => renditionRef.current?.next(), [renditionRef]);

    return { navigationData, progressPercent, toc, handleTocNavigation, handlePrevPage, handleNextPage };
};