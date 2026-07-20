// src/pages/reader/hooks/notes/useEpubNotes.js
import { useEffect, useRef, useCallback } from 'react';

export const useEpubNotes = (
    isBookReadyRef,
    bookNotes,
    onNoteClick,
    loading,
    { addHighlight, removeHighlight, activeHighlights }
) => {
    const syncTimeoutRef = useRef(null);
    const lastRenderedNotesCfiRef = useRef(new Set());

    const syncNotesDiff = useCallback(() => {
        if (!isBookReadyRef.current || loading) return;

        const currentNotes = Array.isArray(bookNotes) ? bookNotes : [];
        const currentCfis = new Set(currentNotes.map(n => n.cfi).filter(Boolean));

        console.log(`[useEpubNotes] 🔍 Анализ изменений заметок. Всего в базе: ${currentNotes.length}, Подсвечено в DOM: ${activeHighlights.size}`);

        let deletedCount = 0;
        let addedCount = 0;
        let skippedCount = 0;

        // 1. ТОЧЕЧНОЕ УДАЛЕНИЕ
        lastRenderedNotesCfiRef.current.forEach(cfi => {
            if (!currentCfis.has(cfi)) {
                console.log(`[useEpubNotes] 🔴 Точечное УДАЛЕНИЕ хайлайта для CFI: ${cfi}`);
                removeHighlight(cfi);
                lastRenderedNotesCfiRef.current.delete(cfi);
                deletedCount++;
            }
        });

        // 2. ТОЧЕЧНАЯ ОТРИСОВКА / ПРОВЕРКА КЭША
        currentNotes.forEach(note => {
            if (!note.cfi) return;

            const alreadyInDOM = activeHighlights.has(note.cfi);

            if (!alreadyInDOM) {
                console.log(`[useEpubNotes] 🟢 Точечное ДОБАВЛЕНИЕ хайлайта для CFI: ${note.cfi}`);
                addHighlight(note.cfi, () => {
                    if (onNoteClick) onNoteClick(note);
                });
                addedCount++;
            } else {
                skippedCount++;
            }

            lastRenderedNotesCfiRef.current.add(note.cfi);
        });

        if (addedCount > 0 || deletedCount > 0) {
            console.log(`[useEpubNotes] ✅ Синхронизация завершена. Добавлено: ${addedCount}, Удалено: ${deletedCount}, Пропущено (уже в DOM): ${skippedCount}`);
        } else {
            console.log(`[useEpubNotes] ⚡ Изменений нет. Все ${skippedCount} хайлайтов актуальны, вызовы к epub.js заблокированы.`);
        }

    }, [bookNotes, loading, isBookReadyRef, addHighlight, removeHighlight, activeHighlights, onNoteClick]);

    // Метод для обработки смены страниц в epub.js
    const handlePageChangeSync = useCallback(() => {
        if (!isBookReadyRef.current) return;

        console.log('[useEpubNotes] 🔄 Триггер смены страницы/отрисовки DOM. Проверяем состояние хайлайтов...');

        let restoredCount = 0;
        let activeCount = 0;

        const safeNotes = Array.isArray(bookNotes) ? bookNotes : [];

        safeNotes.forEach(note => {
            if (!note.cfi) return;

            if (!activeHighlights.has(note.cfi)) {
                console.log(`[useEpubNotes] 🛠️ Восстановление хайлайта на новой странице для CFI: ${note.cfi}`);
                addHighlight(note.cfi, () => {
                    if (onNoteClick) onNoteClick(note);
                });
                restoredCount++;
            } else {
                activeCount++;
            }
        });

        console.log(`[useEpubNotes] 📊 Результат проверки страницы: Восстановлено: ${restoredCount}, Остались нетронутыми: ${activeCount}`);
    }, [bookNotes, addHighlight, onNoteClick, activeHighlights, isBookReadyRef]);

    // Реакция на изменение массива заметок
    useEffect(() => {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

        syncTimeoutRef.current = setTimeout(() => {
            syncNotesDiff();
        }, 150);

        return () => {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, [bookNotes, loading, syncNotesDiff]);

    return {
        forceFullSync: handlePageChangeSync
    };
};