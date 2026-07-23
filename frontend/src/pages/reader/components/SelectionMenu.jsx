import React, { useState, useEffect, useRef } from "react";
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

  // При изменении видимости, режима или высоты проверяем, хватает ли места сверху
  useEffect(() => {
    if (visible && menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight || 150; // Высота меню с запасом
      const spaceAbove = top; // Расстояние от верха экрана до точки выделения

      // Если сверху осталось меньше места, чем высота меню + отступ (20px), показываем снизу
      if (spaceAbove < menuHeight + 20) {
        setPlacement("bottom");
      } else {
        setPlacement("top");
      }
    }
  }, [visible, top, viewMode]);

  useEffect(() => {
    if (!visible) {
      setViewMode("menu");
      resetTranslation();
    }
  }, [visible, resetTranslation]);

  if (!visible) return null;

  const handleTranslateClick = () => {
    setViewMode("translation");
    translate(selectedText, "EN");
  };

  // Динамические стили позиционирования
  const isTop = placement === "top";

  const dynamicStyles = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    // Если сверху — сдвигаем вверх (-100%). Если снизу — опускаем вниз (0%)
    transform: isTop ? "translate(-50%, -100%)" : "translate(-50%, 0%)",
    marginTop: isTop ? "-10px" : "25px", // Отступ от выделенного текста
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    background: "#222",
    padding: viewMode === "menu" ? "6px 12px" : "12px",
    borderRadius: "8px",
    boxShadow: "0px 4px 12px rgba(0,0,0,0.4)",
    minWidth: viewMode === "translation" ? "250px" : "auto",
    maxWidth: "320px",
    maxHeight: "200px", // Защита от слишком длинного текста
    overflowY: "auto", // Если перевод длинный — появится скролл
    transition: "padding 0.2s ease, width 0.2s ease",
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
          {/* Кнопка "Назад" */}
          <div
            style={{
              borderBottom: "1px solid #444",
              paddingBottom: "4px",
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
