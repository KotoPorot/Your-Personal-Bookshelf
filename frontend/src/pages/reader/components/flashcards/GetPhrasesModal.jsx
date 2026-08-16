import React, { useState } from "react";
import { useFlashcard } from "../../context/FlashcardContext";
import { useTranslationSettings } from "../../../../context/TranslationContext";
import { usePhrasesBuilder } from "../../hooks/flashcards/usePhrasesBuilder";
import "./GetPhrasesModal.css";

const GetPhrasesModal = () => {
  const {
    isOpen,
    closeModal,
    selectedText,
    contextText,
    openCreateCardModal,
    isCreateCardOpen,
  } = useFlashcard();
  const { targetLanguage } = useTranslationSettings();

  const [customPhrase, setCustomPhrase] = useState("");

  const { loading, error, phrases } = usePhrasesBuilder(
    isOpen ? selectedText : null,
    contextText,
    targetLanguage,
  );

  if (!isOpen) return null;

  // Первая фраза — полный выделенный текст с переводом
  const mainPhrase = phrases[0];
  // Остальные фразы — ключевые слова и идиомы
  const idiomsList = phrases.slice(1);

  const handleCardClick = (phrase) => {
    openCreateCardModal(phrase);
  };

  const handleCustomCardCreate = () => {
    if (!customPhrase.trim()) return;
    openCreateCardModal({
      sourceText: customPhrase.trim(),
      translation: "",
    });
    setCustomPhrase("");
  };

  return (
    <div
      className="flashcard-modal-overlay"
      onClick={closeModal}
      style={{ display: isCreateCardOpen ? "none" : "flex" }}
    >
      <div
        className="flashcard-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ХЕДЕР */}
        <div className="flashcard-modal-header">
          <h3>Анализ текста</h3>
          <button
            className="flashcard-close-btn"
            onClick={closeModal}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* ТЕЛО МОДАЛКИ */}
        <div className="flashcard-modal-body">
          {error && <div className="flashcard-error-banner">{error}</div>}

          {loading ? (
            <div className="flashcard-loading">⏳ ИИ анализирует текст...</div>
          ) : (
            <div className="flashcard-phrases-wrapper">
              {/* 1. ВЫДЕЛЕННЫЙ ТЕКСТ И ЕГО ПЕРЕВОД */}
              {mainPhrase && (
                <div className="flashcard-section">
                  <label className="flashcard-section-label">
                    Выделенный фрагмент:
                  </label>
                  <div className="flashcard-phrase-card main-text-card">
                    <div className="flashcard-phrase-info">
                      <div className="flashcard-phrase-text">
                        {mainPhrase.sourceText}
                      </div>
                      <div className="flashcard-phrase-translation">
                        {mainPhrase.translation}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. КАСТОМНЫЙ ВВОД СВОЕЙ ФРАЗЫ */}
              <div className="flashcard-section">
                <label className="flashcard-section-label">Своя фраза:</label>
                <div className="flashcard-custom-phrase-row">
                  <input
                    type="text"
                    className="flashcard-input-field"
                    placeholder="Введите фразу вручную..."
                    value={customPhrase}
                    onChange={(e) => setCustomPhrase(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCustomCardCreate();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="flashcard-create-btn"
                    onClick={handleCustomCardCreate}
                    disabled={!customPhrase.trim()}
                  >
                    Создать карточку
                  </button>
                </div>
              </div>

              {/* 3. СПИСОК ИДИОМ И КЛЮЧЕВЫХ ФРАЗ */}
              {idiomsList.length > 0 && (
                <div className="flashcard-section">
                  <label className="flashcard-section-label">
                    Найденные фразы и идиомы:
                  </label>
                  <div className="flashcard-phrase-list">
                    {idiomsList.map((phrase, index) => (
                      <div
                        key={phrase.id || index}
                        className="flashcard-phrase-card"
                      >
                        <div className="flashcard-phrase-info">
                          <div className="flashcard-phrase-text">
                            {phrase.sourceText}
                          </div>
                          <div className="flashcard-phrase-translation">
                            {phrase.translation}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="flashcard-create-btn"
                          onClick={() => handleCardClick(phrase)}
                        >
                          Создать карточку
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ФУТЕР */}
        <div className="flashcard-modal-footer">
          <button
            className="flashcard-btn-secondary"
            onClick={closeModal}
            type="button"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetPhrasesModal;
