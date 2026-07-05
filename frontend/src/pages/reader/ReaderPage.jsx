import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import TocModal from './TocModal';
import BookViewer from './BookViewer';
import './test.css';

const ReaderPage = ({ bookId, onBack }) => {
    const viewerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Двухъярусные метаданные ---
    const [currentSection, setCurrentSection] = useState(1);
    const [totalSections, setTotalSections] = useState(1);
    const [currentChapter, setCurrentChapter] = useState(1);
    const [totalChapters, setTotalChapters] = useState(1);

    const [progressPercent, setProgressPercent] = useState(0);
    const [totalSecondsSpent, setTotalSecondsSpent] = useState(0);

    // --- Оглавление ---
    const [toc, setToc] = useState([]);
    const [isTocOpen, setIsTocOpen] = useState(false);

    const bookRef = useRef(null);
    const renditionRef = useRef(null);
    const sectionsRef = useRef([]);

    const sessionSecondsRef = useRef(0);
    const saveTimeoutRef = useRef(null);
    const isInitializing = useRef(false);

    const dbSimulationKey = `mock_backend_progress_${bookId}`;

    // Секундомер чтения
    useEffect(() => {
        const savedData = localStorage.getItem(dbSimulationKey);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setTotalSecondsSpent(parsed.totalTimeSpent || 0);
        }

        const interval = setInterval(() => {
            sessionSecondsRef.current += 1;
            setTotalSecondsSpent(prev => prev + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
            clearTimeout(saveTimeoutRef.current);
        };
    }, [dbSimulationKey]);

    // Расчет разделов и глав внутри них
    const updateNavigationProgress = (location) => {
        if (!bookRef.current || !location) return;

        try {
            const spineIndex = location.start?.index || 0;

            let currentPercent = 0;
            if (bookRef.current.locations && typeof bookRef.current.locations.percentageFromCfi === 'function') {
                currentPercent = bookRef.current.locations.percentageFromCfi(location.start.cfi) || 0;
                setProgressPercent(currentPercent);
            }

            const sections = sectionsRef.current;
            if (sections.length > 0) {
                let secIdx = sections.findIndex(s => spineIndex >= s.startIndex && spineIndex <= s.endIndex);
                if (secIdx === -1) {
                    secIdx = spineIndex < sections[0].startIndex ? 0 : sections.length - 1;
                }

                const activeSection = sections[secIdx];

                setCurrentSection(secIdx + 1);
                setTotalSections(sections.length);

                const chapInsideSec = spineIndex - activeSection.startIndex + 1;
                const totalChapsInSec = activeSection.endIndex - activeSection.startIndex + 1;

                setCurrentChapter(chapInsideSec);
                setTotalChapters(totalChapsInSec);
            } else {
                setCurrentSection(1);
                setTotalSections(1);
                setCurrentChapter(spineIndex + 1);
                setTotalChapters(bookRef.current.spine?.length || 1);
            }

            return currentPercent;
        } catch (e) {
            console.warn("Ошибка при обновлении прогресса:", e);
        }
    };

    // Навигация (теперь принимает прямой href конкретной подглавы)
    const handleTocNavigation = (href) => {
        if (renditionRef.current) {
            renditionRef.current.display(href);
            setIsTocOpen(false);
        }
    };

    const handlePrevPage = () => renditionRef.current?.prev();
    const handleNextPage = () => renditionRef.current?.next();

    // Инициализация книги
    useEffect(() => {
        let isMounted = true;

        if (!viewerRef.current) return;
        if (bookRef.current || isInitializing.current) return;

        const loadBook = async () => {
            try {
                isInitializing.current = true;
                setLoading(true);

                const token = localStorage.getItem('token');
                if (!token) throw new Error('Нет токена авторизации');

                const response = await fetch(`http://localhost:8080/api/v1/books/getBook/${bookId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Не удалось загрузить книгу');
                const arrayBuffer = await response.arrayBuffer();

                if (!isMounted) return;

                const book = ePub();
                bookRef.current = book;
                await book.open(arrayBuffer);

                if (!isMounted) return;

                // Парсинг структуры книги и генерация подглав
                book.loaded.navigation.then((nav) => {
                    if (isMounted && nav && nav.toc) {
                        const processed = [];

                        nav.toc.forEach((tocItem) => {
                            const spineIdx = book.spine.get(tocItem.href);
                            if (spineIdx) {
                                processed.push({
                                    label: tocItem.label,
                                    href: tocItem.href,
                                    startIndex: spineIdx.index
                                });
                            }
                        });

                        processed.sort((a, b) => a.startIndex - b.startIndex);

                        const totalSpineItems = book.spine.length;
                        for (let i = 0; i < processed.length; i++) {
                            const nextSec = processed[i + 1];
                            processed[i].endIndex = nextSec ? nextSec.startIndex - 1 : totalSpineItems - 1;

                            // Генерируем массив глав для этого раздела
                            const subChapters = [];
                            for (let j = processed[i].startIndex; j <= processed[i].endIndex; j++) {
                                const spineElement = book.spine.items[j];
                                subChapters.push({
                                    chapterNum: j - processed[i].startIndex + 1,
                                    label: `Глава ${j - processed[i].startIndex + 1}`,
                                    href: spineElement?.href || processed[i].href
                                });
                            }
                            processed[i].chapters = subChapters;
                        }

                        sectionsRef.current = processed;
                        setToc(processed);

                        if (renditionRef.current) {
                            const currentLoc = renditionRef.current.currentLocation();
                            if (currentLoc) updateNavigationProgress(currentLoc);
                        }
                    }
                });

                const rendition = book.renderTo(viewerRef.current, {
                    width: '100%',
                    height: '100%',
                    flow: 'paginated',
                    manager: 'default',
                    allowScriptedContent: true,
                });
                renditionRef.current = rendition;

                rendition.on('relocated', (location) => {
                    if (!isMounted || !bookRef.current) return;

                    const currentCfi = location.start.cfi;
                    const calculatedPercent = updateNavigationProgress(location) || 0;

                    clearTimeout(saveTimeoutRef.current);
                    saveTimeoutRef.current = setTimeout(() => {
                        if (isMounted) {
                            saveProgressLocally(currentCfi, calculatedPercent);
                        }
                    }, 2000);
                });

                const savedData = localStorage.getItem(dbSimulationKey);
                const initialCfi = savedData ? JSON.parse(savedData).currentCfi : undefined;

                await rendition.display(initialCfi);

                if (isMounted) setLoading(false);

                book.ready.then(async () => {
                    if (!isMounted) return;
                    try {
                        await book.locations.generate(150);
                        const currentLocation = rendition.currentLocation();
                        if (currentLocation && isMounted) {
                            const initialPercent = book.locations.percentageFromCfi(currentLocation.start.cfi) || 0;
                            setProgressPercent(initialPercent);
                        }
                    } catch (err) {
                        console.warn("Фоновый расчет процентов задерживается:", err);
                    }
                });

            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    setError('Ошибка при загрузке книги');
                    setLoading(false);
                }
            } finally {
                isInitializing.current = false;
            }
        };

        const saveProgressLocally = (cfi, percent) => {
            const savedData = localStorage.getItem(dbSimulationKey);
            const prevTotalTime = savedData ? JSON.parse(savedData).totalTimeSpent : 0;

            const mockBackendPayload = {
                bookId: bookId,
                currentCfi: cfi,
                progressPercent: percent,
                totalTimeSpent: prevTotalTime + sessionSecondsRef.current,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(dbSimulationKey, JSON.stringify(mockBackendPayload));
            sessionSecondsRef.current = 0;
        };

        loadBook();

        return () => {
            isMounted = false;
            if (renditionRef.current) renditionRef.current.destroy();
            if (bookRef.current) bookRef.current.destroy();
        };
    }, [bookId, dbSimulationKey]);

    // Слушатели клавиш и ресайз
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.key === 'ArrowLeft') handlePrevPage();
            if (event.key === 'ArrowRight') handleNextPage();
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (renditionRef.current?.manager) renditionRef.current.resize();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    };

    return (
        <div className="reader-container">
            <aside className="reader-sidebar">
                <button className="sidebar-btn" onClick={onBack}>⬅ Назад</button>
                <button className="sidebar-btn">📝 Заметки</button>
                <button className="sidebar-btn" onClick={() => setIsTocOpen(!isTocOpen)}>
                    📖 Оглавление
                </button>

                <div className="meta-panel">
                    <h3>Статистика</h3>
                    <div className="meta-item">
                        <span className="meta-label">Времени в книге:</span>
                        <span className="meta-value">{formatTime(totalSecondsSpent)}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Прогресс:</span>
                        <span className="meta-value">
                            {isNaN(progressPercent) ? '0.0%' : `${(progressPercent * 100).toFixed(1)}%`}
                        </span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Раздел:</span>
                        <span className="meta-value">{currentSection} из {totalSections}</span>
                    </div>
                    <div className="meta-item">
                        <span className="meta-label">Глава в разделе:</span>
                        <span className="meta-value">{currentChapter} из {totalChapters}</span>
                    </div>
                </div>
            </aside>

            <BookViewer
                ref={viewerRef}
                loading={loading}
                error={error}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
            />

            <TocModal
                isOpen={isTocOpen}
                onClose={() => setIsTocOpen(false)}
                toc={toc}
                currentSection={currentSection}
                currentChapter={currentChapter}
                onNavigate={handleTocNavigation}
            />
        </div>
    );
};

export default ReaderPage;