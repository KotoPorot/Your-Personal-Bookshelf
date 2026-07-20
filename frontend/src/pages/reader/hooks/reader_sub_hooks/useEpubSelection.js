import { useEffect, useRef } from 'react';

export const useEpubSelection = (renditionRef, onLocationChangeRef, bookLoaded) => {
    const lastSelectionTimeRef = useRef(0);
    const hasBoundSelectionRef = useRef(false);

    useEffect(() => {
        // Слушаем флаг bookLoaded вместо пустого рефа
        if (!bookLoaded || !renditionRef.current || hasBoundSelectionRef.current) return;
        hasBoundSelectionRef.current = true;

        const rendition = renditionRef.current;
        let activeHighlightCfi = null;
        let isMouseDown = false;
        let pendingSelection = null;

        const handleSelectionActual = (cfiRange, contents) => {
            const selection = contents.window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const text = range.toString().trim();
            if (!text) return;

            const rect = range.getBoundingClientRect();
            const iframeRect = contents.window.frameElement.getBoundingClientRect();
            const top = rect.top + iframeRect.top - 45;
            const left = rect.left + iframeRect.left + (rect.width / 2);

            if (activeHighlightCfi) {
                rendition.annotations.remove(activeHighlightCfi, 'highlight');
            }

            rendition.annotations.add('highlight', cfiRange, {}, null, 'tmp-selection-highlight', {
                fill: '#007bff',
                'fill-opacity': '0.3',
                'mix-blend-mode': 'multiply'
            });

            activeHighlightCfi = cfiRange;
            lastSelectionTimeRef.current = Date.now();

            if (onLocationChangeRef.current) {
                onLocationChangeRef.current({ type: 'selection', cfi: cfiRange, text, top, left });
            }
            selection.removeAllRanges();
        };

        rendition.hooks.content.register((contents) => {
            const doc = contents.document;
            doc.addEventListener('mousedown', () => { isMouseDown = true; pendingSelection = null; });
            doc.addEventListener('mouseup', () => {
                isMouseDown = false;
                if (pendingSelection) {
                    handleSelectionActual(pendingSelection.cfiRange, pendingSelection.contents);
                    pendingSelection = null;
                }
            });
        });

        rendition.on('selected', (cfiRange, contents) => {
            if (isMouseDown) {
                pendingSelection = { cfiRange, contents };
            } else {
                handleSelectionActual(cfiRange, contents);
            }
        });

        rendition.on('click', () => {
            if (Date.now() - lastSelectionTimeRef.current < 250) return;

            pendingSelection = null;
            isMouseDown = false;

            if (activeHighlightCfi) {
                rendition.annotations.remove(activeHighlightCfi, 'highlight');
                activeHighlightCfi = null;
            }

            if (onLocationChangeRef.current) {
                onLocationChangeRef.current({ type: 'click' });
            }
        });
    }, [bookLoaded, renditionRef, onLocationChangeRef]);
};