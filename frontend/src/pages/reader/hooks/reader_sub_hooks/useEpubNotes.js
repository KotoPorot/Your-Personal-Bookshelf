// src/pages/reader/hooks/sub-hooks/useEpubNotes.js
import { useEffect, useRef, useCallback } from 'react';

export const useEpubNotes = (renditionRef, isBookReadyRef, bookNotes, onNoteClick, loading) => {
    const renderedCfisRef = useRef([]);
    const syncTimeoutRef = useRef(null);

    const syncNotesAnnotations = useCallback((forceImmediate = false) => {
        const rendition = renditionRef.current;
        if (!rendition || !isBookReadyRef.current) return;

        const executeSync = () => {
            const currentRendition = renditionRef.current;
            if (!currentRendition) return;

            renderedCfisRef.current.forEach(cfi => {
                try { currentRendition.annotations.remove(cfi, 'highlight'); } catch (e) {}
            });
            renderedCfisRef.current = [];

            bookNotes.forEach(note => {
                if (!note.cfi) return;
                try {
                    currentRendition.annotations.add(
                        'highlight',
                        note.cfi,
                        {},
                        () => { if (onNoteClick) onNoteClick(note); },
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
                    console.error("Не удалось подсветить заметку для CFI:", note.cfi, e);
                }
            });
        };

        if (forceImmediate) {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            executeSync();
        } else {
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(executeSync, 150);
        }
    }, [bookNotes, onNoteClick, renditionRef, isBookReadyRef]);

    useEffect(() => {
        if (!loading && isBookReadyRef.current) {
            syncNotesAnnotations();
        }
    }, [bookNotes, loading, isBookReadyRef, syncNotesAnnotations]);

    useEffect(() => {
        return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
    }, []);

    return { syncNotesAnnotations };
};