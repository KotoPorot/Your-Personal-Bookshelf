import { useState, useCallback } from 'react';

export const useTextSelection = ({ viewerRef }) => {
    // Состояние исключительно для плавающего тулбара над выделенным текстом
    const [selectionMenu, setSelectionMenu] = useState({
        visible: false,
        top: 0,
        left: 0,
        text: '',
        cfi: ''
    });

    // Функция для принудительного снятия синего выделения текста в браузере
    const clearBrowserSelection = useCallback(() => {
        console.log("[useTextSelection] Сброс нативного синего выделения текста...");

        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }

        if (viewerRef?.current) {
            const iframes = viewerRef.current.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                try {
                    const iframeWindow = iframe.contentWindow;
                    if (iframeWindow && iframeWindow.getSelection) {
                        iframeWindow.getSelection().removeAllRanges();
                    }
                } catch (e) {
                    // Игнорируем cross-origin ограничения
                }
            });
        }
    }, [viewerRef]);

    // Вызывается, когда epub.js ловит выделение текста
    const handleTextSelected = useCallback(({ cfi, text, top, left }) => {
        console.log(`%c📝 [useTextSelection] Текст выделен. CFI: ${cfi}`, "color: #0288d1; font-weight: bold;");
        setSelectionMenu({
            visible: true,
            top,
            left,
            text,
            cfi
        });
    }, []);

    const closeSelectionMenu = useCallback(() => {
        setSelectionMenu(prev => ({ ...prev, visible: false }));
    }, []);

    return {
        selectionMenu,
        handleTextSelected,
        closeSelectionMenu,
        clearBrowserSelection
    };
};