// src/pages/reader/hooks/text_selection/useEpubSelection.js
import { useEffect, useRef } from "react";

export const useEpubSelection = (
  renditionRef,
  onLocationChangeRef,
  bookLoaded,
  { setTemporarySelection, clearTemporarySelection },
) => {
  const lastSelectionTimeRef = useRef(0);
  const hasBoundSelectionRef = useRef(false);

  useEffect(() => {
    if (!bookLoaded || !renditionRef.current || hasBoundSelectionRef.current)
      return;
    hasBoundSelectionRef.current = true;

    const rendition = renditionRef.current;
    let isMouseDown = false;
    let pendingSelection = null;

    const handleSelectionActual = (cfiRange, contents) => {
      const selection = contents.window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const text = range.toString().trim();
      if (!text) return;

      // 👈 1. ИЗВЛЕКАЕМ КОНТЕКСТ (родительский абзац/блок)
      let contextText = text; // По умолчанию, если контейнер не найдется
      try {
        let container = range.commonAncestorContainer;
        if (container.nodeType === Node.TEXT_NODE) {
          container = container.parentElement;
        }
        const blockElement =
          container.closest("p, div, section, article, blockquote, li") ||
          container;
        if (blockElement && blockElement.textContent) {
          contextText = blockElement.textContent.trim();
        }
      } catch (e) {
        console.warn("[useEpubSelection] Не удалось извлечь контекст:", e);
      }

      const rect = range.getBoundingClientRect();
      const iframeRect = contents.window.frameElement.getBoundingClientRect();
      const top = rect.top + iframeRect.top - 45;
      const left = rect.left + iframeRect.left + rect.width / 2;

      // Обращаемся к единому менеджеру для создания синей подсветки
      setTemporarySelection(cfiRange);
      lastSelectionTimeRef.current = Date.now();

      if (onLocationChangeRef.current) {
        // 👈 2. Пробрасываем contextText дальше
        onLocationChangeRef.current({
          type: "selection",
          cfi: cfiRange,
          text,
          contextText,
          top,
          left,
        });
      }
      selection.removeAllRanges();
    };

    rendition.hooks.content.register((contents) => {
      const doc = contents.document;
      doc.addEventListener("mousedown", () => {
        isMouseDown = true;
        pendingSelection = null;
      });
      doc.addEventListener("mouseup", () => {
        isMouseDown = false;
        if (pendingSelection) {
          handleSelectionActual(
            pendingSelection.cfiRange,
            pendingSelection.contents,
          );
          pendingSelection = null;
        }
      });
    });

    rendition.on("selected", (cfiRange, contents) => {
      if (isMouseDown) {
        pendingSelection = { cfiRange, contents };
      } else {
        handleSelectionActual(cfiRange, contents);
      }
    });

    rendition.on("click", () => {
      if (Date.now() - lastSelectionTimeRef.current < 250) return;

      pendingSelection = null;
      isMouseDown = false;

      // Стираем синее выделение через менеджер при клике в пустое место
      clearTemporarySelection();

      if (onLocationChangeRef.current) {
        onLocationChangeRef.current({ type: "click" });
      }
    });
  }, [
    bookLoaded,
    renditionRef,
    onLocationChangeRef,
    setTemporarySelection,
    clearTemporarySelection,
  ]);
};
