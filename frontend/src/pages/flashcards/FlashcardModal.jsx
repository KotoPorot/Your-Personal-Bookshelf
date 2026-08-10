import React, { useState, useEffect, useRef } from "react";

const FlashcardModal = ({
  isOpen,
  onClose,
  card,
  folders,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
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
      setIsFlipped(false);
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
        className="book-info-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "650px", width: "100%" }}
      >
        {/* Шапка модалки */}
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

        {/* Тело модалки */}
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <span className="info-label">
                  Папка: <strong>{folderName}</strong>
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ fontSize: "0.85rem", padding: "4px 12px" }}
                >
                  🔄{" "}
                  {isFlipped
                    ? "Показать Лицевую сторону"
                    : "Перевернуть на Обратную"}
                </button>
              </div>

              {/* Блок самой карточки */}
              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "20px",
                  backgroundColor: isFlipped ? "#f4f6f9" : "#ffffff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  minHeight: "220px",
                }}
              >
                {!isFlipped ? (
                  /* ЛИЦЕВАЯ СТОРОНА */
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#007bff",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      Лицевая сторона
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <strong
                        style={{
                          color: "#555",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Определение:
                      </strong>
                      <p
                        style={{
                          margin: 0,
                          fontStyle: "italic",
                          color: "#333",
                        }}
                      >
                        {card.definition}
                      </p>
                    </div>

                    <div>
                      <strong
                        style={{
                          color: "#555",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Примеры (с пропусками):
                      </strong>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {card.examples?.map((ex, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                              borderLeft: "3px solid #007bff",
                              fontSize: "0.95rem",
                            }}
                          >
                            {ex.clozeSentence}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ОБРАТНАЯ СТОРОНА */
                  <div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#28a745",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      Обратная сторона
                    </div>

                    <div
                      style={{
                        marginBottom: "16px",
                        paddingBottom: "12px",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <h2 style={{ margin: "0 0 4px 0", color: "#212529" }}>
                        {card.phrase}
                      </h2>
                      <span style={{ fontSize: "1.1rem", color: "#6c757d" }}>
                        {card.phraseTranslation}
                      </span>
                    </div>

                    <div>
                      <strong
                        style={{
                          color: "#555",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Полные предложения и перевод:
                      </strong>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        {card.examples?.map((ex, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#ffffff",
                              borderRadius: "6px",
                              border: "1px solid #e9ecef",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "500",
                                color: "#212529",
                                marginBottom: "2px",
                              }}
                            >
                              {ex.sentence}
                            </div>
                            <div
                              style={{ fontSize: "0.88rem", color: "#6c757d" }}
                            >
                              {ex.translation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
