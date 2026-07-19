// src/pages/reader/hooks/sub-hooks/useEpubNotes.js
import { useEffect, useRef, useCallback } from 'react';

export const useEpubNotes = (renditionRef, isBookReadyRef, bookNotes, onNoteClick, loading) => {
    const renderedCfisRef = useRef([]);
    const syncTimeoutRef = useRef(null);

    const syncNotesAnnotations = useCallback((forceImmediate = false) => {
        const rendition = renditionRef.current;

        console.log(`[useEpubNotes] syncNotesAnnotations вызван. forceImmediate: ${forceImmediate}, bookReady: ${isBookReadyRef.current}, renditionИнициализирован: ${!!rendition}`);

        if (!rendition) {
            console.warn('[useEpubNotes] Пропуск синхронизации: renditionRef.current равен null');
            return;
        }
        if (!isBookReadyRef.current) {
            console.warn('[useEpubNotes] Пропуск синхронизации: книга еще не готова (isBookReadyRef.current === false)');
            return;
        }

        const executeSync = () => {
            const currentRendition = renditionRef.current;
            if (!currentRendition) {
                console.error('[useEpubNotes] Ошибка в executeSync: rendition пропал в момент выполнения');
                return;
            }

            console.log(`[useEpubNotes] Выполнение executeSync. Очистка старых хайлайтов: ${renderedCfisRef.current.length} шт. Отрисовка новых: ${bookNotes.length} шт.`);

            // 1. Очищаем старые хайлайты перед перерисовкой
            renderedCfisRef.current.forEach(cfi => {
                try {
                    currentRendition.annotations.remove(cfi, 'highlight');
                } catch (e) {
                    console.error(`[useEpubNotes] Ошибка при удалении хайлайта для CFI: ${cfi}`, e);
                }
            });
            renderedCfisRef.current = [];

            // 2. Рендерим актуальные хайлайты
            bookNotes.forEach((note, index) => {
                if (!note.cfi) {
                    console.warn(`[useEpubNotes] У заметки с индексом ${index} отсутствует cfi:`, note);
                    return;
                }

                try {
                    console.log(`[useEpubNotes] Попытка добавить хайлайт для CFI: ${note.cfi}`);
                    currentRendition.annotations.add(
                        'highlight',
                        note.cfi,
                        {},
                        () => {
                            console.log(`[useEpubNotes] Клик по хайлайту заметки:`, note);
                            if (onNoteClick) onNoteClick(note);
                        },
                        'book-note-highlight',
                        {
                            fill: '#ffc107',
                            'fill-opacity': '0.35',
                            'mix-blend-mode': 'multiply',
                            cursor: 'pointer'
                        }
                    );
                    renderedCfisRef.current.push(note.cfi);
                } catch (e) {
                    console.error(`[useEpubNotes] КРИТИЧЕСКАЯ ОШИБКА при добавлении хайлайта для CFI: ${note.cfi}. Возможно, DOM-структура страницы еще не готова или CFI невалиден.`, e);
                }
            });

            console.log(`[useEpubNotes] executeSync завершен успешно. Всего добавлено хайлайтов: ${renderedCfisRef.current.length}`);
        };

        if (forceImmediate) {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            executeSync();
        } else {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            console.log('[useEpubNotes] Синхронизация отложена (таймаут 150мс)');
            syncTimeoutRef.current = setTimeout(executeSync, 150);
        }
    }, [bookNotes, onNoteClick, renditionRef, isBookReadyRef]);

    // ЭФФЕКТ 1: Привязка к нативным событиям отрисовки epub.js
    useEffect(() => {
        const rendition = renditionRef.current;
        if (!rendition) {
            console.log('[useEpubNotes] Эффект подписки на события epub.js: rendition еще не создан');
            return;
        }

        console.log('[useEpubNotes] Эффект подписки на события epub.js: успешно подписались на "rendered" и "relocated"');

        const handleRendered = (section) => {
            console.log(`[useEpubNotes] Событие epub.js: Секция/страница успешно отрендерена в DOM. ID секции: ${section?.id}`);
            syncNotesAnnotations(true);
        };

        const handleRelocated = (location) => {
            console.log(`[useEpubNotes] Событие epub.js: Локация изменена (relocated). CFI страницы: ${location?.start?.cfi}`);
            syncNotesAnnotations(true);
        };

        rendition.on('rendered', handleRendered);
        rendition.on('relocated', handleRelocated);

        return () => {
            console.log('[useEpubNotes] Отписка от событий epub.js (размонтирование/обновление эффекта)');
            rendition.off('rendered', handleRendered);
            rendition.off('relocated', handleRelocated);
        };
    }, [renditionRef, syncNotesAnnotations]);

    // ЭФФЕКТ 2: Срабатывает при изменении списка заметок или статуса загрузки React
    useEffect(() => {
        console.log(`[useEpubNotes] Эффект изменения зависимостей. loading: ${loading}, bookReady: ${isBookReadyRef.current}, количество заметок: ${bookNotes.length}`);

        if (!loading && isBookReadyRef.current) {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

            console.log('[useEpubNotes] Запуск отложенного таймаута (200мс) после изменения заметок/загрузки...');
            syncTimeoutRef.current = setTimeout(() => {
                console.log('[useEpubNotes] Время таймаута вышло, вызываем syncNotesAnnotations(true)');
                syncNotesAnnotations(true);
            }, 200);
        }
    }, [bookNotes, loading, isBookReadyRef, syncNotesAnnotations]);

    // Очистка при уничтожении компонента
    useEffect(() => {
        return () => {
            if (syncTimeoutRef.current) {
                console.log('[useEpubNotes] Очистка фонового таймаута при размонтировании хука');
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, []);

    return { syncNotesAnnotations };
};