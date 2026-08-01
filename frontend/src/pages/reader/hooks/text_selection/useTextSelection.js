// src/pages/reader/hooks/text_selection/useTextSelection.js
import { useState, useCallback } from "react";

export const useTextSelection = ({ viewerRef }) => {
  const [selectionMenu, setSelectionMenu] = useState({
    visible: false,
    top: 0,
    left: 0,
    text: "",
    contextText: "", // 👈 1. Добавили поле contextText
    cfi: "",
  });

  // Безопасный сброс нативного выделения текста во всех доступных фреймах
  const clearBrowserSelection = useCallback(() => {
    console.log(
      "[useTextSelection] Сброс нативного синего выделения текста...",
    );

    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }

    if (viewerRef?.current) {
      const iframes = viewerRef.current.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow && iframeWindow.getSelection) {
            iframeWindow.getSelection().removeAllRanges();
          }
        } catch (e) {
          // Игнорируем cross-origin ограничения для сторонних фреймов
        }
      });
    }
  }, [viewerRef]);

  // Обработчик события выделения текста от ядра книги
  const handleTextSelected = useCallback(
    ({ cfi, text, contextText, top, left }) => {
      console.log(
        `%c📝 [useTextSelection] Текст выделен. CFI: ${cfi}`,
        "color: #0288d1; font-weight: bold;",
      );
      setSelectionMenu({
        visible: true,
        top,
        left,
        text,
        contextText: contextText || text, // 👈 2. Сохраняем contextText
        cfi,
      });
    },
    [],
  );

  const closeSelectionMenu = useCallback(() => {
    setSelectionMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    selectionMenu,
    handleTextSelected,
    closeSelectionMenu,
    clearBrowserSelection,
  };
};
