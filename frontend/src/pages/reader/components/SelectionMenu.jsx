import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useReader } from "../context/ReaderContext";
import { useTranslate } from "../hooks/translator/useTranslate";

const SelectionMenu = () => {
  const { state, actions } = useReader();
  const { visible, top, left, text: selectedText } = state.selectionMenu;

  const [viewMode, setViewMode] = useState("menu");
  const menuRef = useRef(null);
  const [placement, setPlacement] = useState("top"); // 'top' или 'bottom'

  const {
    translatedText,
    isLoading,
    error,
    translate,
    reset: resetTranslation,
  } = useTranslate();

  // Используем useLayoutEffect, чтобы пересчитать положение ДО того, как браузер отрисует кадр
  useLayoutEffect(() => {
    if (visible && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight || 150;
      const spaceAbove = top;

      // Если сверху не хватает места под текущую высоту меню (с запасом 20px) — уводим вниз
      if (spaceAbove < menuHeight + 20) {
        setPlacement("bottom");
      } else {
        setPlacement("top");
      }
    }
  }, [visible, top, viewMode, translatedText, isLoading]);

  useEffect(() => {
    if (!visible) {
      setViewMode("menu");
      resetTranslation();
    }
  }, [visible, resetTranslation]);

  if (!visible) return null;

  const handleTranslateClick = () => {
    setViewMode("translation");
    translate(selectedText); // 👈 Берет язык строго из контекста
  };

  const handleClose = () => {
    actions.resetSelection(); // Закрывает меню и сбрасывает выделение
  };

  // Динамические стили позиционирования
  const isTop = placement === "top";

  const dynamicStyles = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    transform: isTop ? "translate(-50%, -100%)" : "translate(-50%, 0%)",
    marginTop: isTop ? "-10px" : "25px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    background: "#222",
    padding: viewMode === "menu" ? "6px 12px" : "12px",
    borderRadius: "8px",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
    minWidth: viewMode === "translation" ? "260px" : "auto",
    maxWidth: "340px",
    maxHeight: "220px",
    overflowY: "auto",
    transition: "padding 0.15s ease",
  };

  return (
    <div
      ref={menuRef}
      className="selection-floating-menu"
      onClick={(e) => e.stopPropagation()}
      style={dynamicStyles}
    >
      {/* РЕЖИМ 1: ОБЫЧНЫЕ КНОПКИ МЕНЮ */}
      {viewMode === "menu" && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={actions.openNoteModal} style={btnStyle}>
            📝 Заметка
          </button>
          <span style={{ color: "#555" }}>|</span>
          <button onClick={handleTranslateClick} style={btnStyle}>
            🌐 Перевести
          </button>
        </div>
      )}

      {/* РЕЖИМ 2: ОТОБРАЖЕНИЕ ПЕРЕВОДА */}
      {viewMode === "translation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Шапка модалки с Назад и Крестиком */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #444",
              paddingBottom: "6px",
              marginBottom: "4px",
            }}
          >
            <button
              onClick={() => setViewMode("menu")}
              style={{
                ...btnStyle,
                fontSize: "11px",
                color: "#888",
                padding: 0,
              }}
            >
              ◀ Назад
            </button>

            <button
              onClick={handleClose}
              style={{
                ...btnStyle,
                fontSize: "14px",
                color: "#888",
                padding: "0 4px",
                lineHeight: 1,
              }}
              title="Закрыть"
            >
              ✕
            </button>
          </div>

          {/* Содержимое: Лоадер / Ошибка / Текст */}
          {isLoading && (
            <div style={{ color: "#aaa", fontSize: "13px" }}>
              ⏳ Переводим...
            </div>
          )}

          {error && (
            <div style={{ color: "#ff6b6b", fontSize: "13px" }}>⚠️ {error}</div>
          )}

          {!isLoading && !error && translatedText && (
            <div style={{ color: "#fff", fontSize: "14px", lineHeight: "1.4" }}>
              {translatedText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const btnStyle = {
  background: "none",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
  padding: "4px",
};

export default SelectionMenu;
