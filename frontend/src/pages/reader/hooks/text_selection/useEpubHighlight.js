// src/pages/reader/hooks/text_selection/useEpubHighlight.js
import { useCallback, useRef } from 'react';

export const useEpubHighlight = (renditionRef) => {
    const activeHighlightsRef = useRef(new Set());
    const tempSelectionCfiRef = useRef(null); // Храним CFI текущего временного выделения

    // 1. Точечное добавление хайлайта
    const addHighlight = useCallback((cfi, onClick, options = {}) => {
        const rendition = renditionRef.current;
        if (!rendition || !cfi) return;

        if (activeHighlightsRef.current.has(cfi)) return;

        const defaultStyles = {
            fill: '#ffc107',
            'fill-opacity': '0.35',
            'mix-blend-mode': 'multiply',
            cursor: 'pointer',
            ...options.styles
        };

        try {
            // Если мы добавляем постоянную заметку поверх временного выделения с тем же CFI,
            // сразу зачищаем временное синее выделение
            if (tempSelectionCfiRef.current === cfi) {
                rendition.annotations.remove(cfi, 'highlight');
                tempSelectionCfiRef.current = null;
            }

            rendition.annotations.add(
                'highlight',
                cfi,
                {},
                () => { if (onClick) onClick(); },
                options.className || 'book-note-highlight',
                defaultStyles
            );
            activeHighlightsRef.current.add(cfi);
        } catch (e) {
            console.error(`[useEpubHighlight] Ошибка добавления хайлайта для CFI: ${cfi}`, e);
        }
    }, [renditionRef]);

    // 2. Управление ВРЕМЕННЫМ синим выделением текста
    const setTemporarySelection = useCallback((cfi) => {
        const rendition = renditionRef.current;
        if (!rendition || !cfi) return;

        // Если уже было временное выделение, убираем его
        if (tempSelectionCfiRef.current) {
            try {
                rendition.annotations.remove(tempSelectionCfiRef.current, 'highlight');
            } catch (e) {}
        }

        try {
            rendition.annotations.add('highlight', cfi, {}, null, 'tmp-selection-highlight', {
                fill: '#007bff',
                'fill-opacity': '0.3',
                'mix-blend-mode': 'multiply'
            });
            tempSelectionCfiRef.current = cfi;
        } catch (e) {
            console.error(`[useEpubHighlight] Ошибка создания временного выделения: ${cfi}`, e);
        }
    }, [renditionRef]);

    // 3. Сброс временного синего выделения
    const clearTemporarySelection = useCallback(() => {
        const rendition = renditionRef.current;
        if (!rendition || !tempSelectionCfiRef.current) return;

        try {
            rendition.annotations.remove(tempSelectionCfiRef.current, 'highlight');
            console.log(`[useEpubHighlight] Временное синее выделение стерто для CFI: ${tempSelectionCfiRef.current}`);
        } catch (e) {
            console.error(`[useEpubHighlight] Ошибка удаления временного выделения`, e);
        }
        tempSelectionCfiRef.current = null;
    }, [renditionRef]);

    // 4. Точечное удаление хайлайта
    const removeHighlight = useCallback((cfi) => {
        const rendition = renditionRef.current;
        if (!rendition || !cfi) return;

        try {
            rendition.annotations.remove(cfi, 'highlight');
            activeHighlightsRef.current.delete(cfi);
        } catch (e) {
            console.error(`[useEpubHighlight] Ошибка удаления хайлайта для CFI: ${cfi}`, e);
        }
    }, [renditionRef]);

    const clearAllHighlights = useCallback(() => {
        const rendition = renditionRef.current;
        if (!rendition) return;

        activeHighlightsRef.current.forEach(cfi => {
            try { rendition.annotations.remove(cfi, 'highlight'); } catch (e) {}
        });
        if (tempSelectionCfiRef.current) {
            try { rendition.annotations.remove(tempSelectionCfiRef.current, 'highlight'); } catch (e) {}
        }
        activeHighlightsRef.current.clear();
        tempSelectionCfiRef.current = null;
    }, [renditionRef]);

    return {
        addHighlight,
        removeHighlight,
        setTemporarySelection,
        clearTemporarySelection,
        clearAllHighlights,
        activeHighlights: activeHighlightsRef.current
    };
};