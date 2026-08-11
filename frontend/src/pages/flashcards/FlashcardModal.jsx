import React, { useState, useEffect, useRef } from "react";
import FlashcardView from "./FlashcardView";
import "./FlashcardModal.css";

const FlashcardModal = ({
  isOpen,
  onClose,
  card,
  folders,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (!isOpen) {
      setIsMovingFolder(false);
      setShowMenu(false);
    }
  }, [isOpen]);

  if (!isOpen || !card) return null;

  const currentFolder = folders.find(
    (f) => Number(f.id) === Number(card.folderId),
  );
  const folderName = currentFolder ? currentFolder.name : "Без папки";

  const handleEditContent = () => {
    alert("Функционал редактирования карточки в разработке");
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Удалить карточку "${card.phrase}"?`)) {
      onDeleteCard(card.id);
      onClose();
    }
    setShowMenu(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="book-info-modal flashcard-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="modal-header">
          <div className="settings-container" ref={menuRef}>
            <button
              className="icon-button settings-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Управление карточкой"
            >
              ⚙️
            </button>

            {showMenu && (
              <div className="settings-dropdown">
                <button onClick={handleEditContent}>✏️ Редактировать</button>
                <button
                  onClick={() => {
                    setIsMovingFolder(true);
                    setShowMenu(false);
                  }}
                >
                  📁 Переместить
                </button>
                <button onClick={handleDelete} className="delete-action">
                  🗑️ Удалить
                </button>
              </div>
            )}
          </div>

          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Тело модального окна */}
        <div className="modal-body">
          {isMovingFolder ? (
            <div className="shelf-selection-view">
              <div
                className="selection-header"
                style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
              >
                <button
                  onClick={() => setIsMovingFolder(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#007bff",
                    cursor: "pointer",
                  }}
                >
                  ← Назад
                </button>
                <h3 style={{ margin: 0 }}>Переместить в папку:</h3>
              </div>

              <div
                className="shelf-list"
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {folders.map((folder) => {
                  const isCurrent = Number(folder.id) === Number(card.folderId);
                  return (
                    <button
                      key={folder.id}
                      disabled={isCurrent}
                      onClick={() => {
                        onUpdateCard({ ...card, folderId: folder.id });
                        setIsMovingFolder(false);
                      }}
                      style={{
                        padding: "10px",
                        textAlign: "left",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        opacity: isCurrent ? 0.6 : 1,
                        cursor: isCurrent ? "not-allowed" : "pointer",
                      }}
                    >
                      {isCurrent
                        ? `📁 ${folder.name} (текущая)`
                        : `📁 ${folder.name}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flashcard-preview-container">
              <div style={{ marginBottom: "12px" }}>
                <span className="info-label">
                  Папка: <strong>{folderName}</strong>
                </span>
              </div>

              {/* Автономная карточка */}
              <FlashcardView card={card} />

              <span className="flashcard-hint">
                💡 Нажмите на карточку, чтобы перевернуть
              </span>
            </div>
          )}
        </div>

        {/* Подвал */}
        {!isMovingFolder && (
          <div className="modal-footer" style={{ marginTop: "15px" }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardModal;
