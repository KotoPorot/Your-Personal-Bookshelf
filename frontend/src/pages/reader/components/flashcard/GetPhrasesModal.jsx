import React from "react";
import { useFlashcard } from "../../context/FlashcardContext";
import { useTranslationSettings } from "../../../../context/TranslationContext";
import { usePhrasesBuilder } from "../../hooks/flashcards/usePhrasesBuilder";
import "./GetPhrasesModal.css";

const GetPhrasesModal = () => {
  const { isOpen, closeModal, selectedText, contextText } = useFlashcard();
  const { targetLanguage } = useTranslationSettings();

  const { loading, error, phrases, handleCreateCard } = usePhrasesBuilder(
    isOpen ? selectedText : null,
    contextText,
    targetLanguage, // 👈 Прокидываем выбранный целевой язык
  );

  if (!isOpen) return null;

  // Первая фраза — полный выделенный текст с переводом
  const mainPhrase = phrases[0];
  // Остальные фразы — ключевые слова и идиомы
  const idiomsList = phrases.slice(1);

  return (
    <div className="flashcard-modal-overlay" onClick={closeModal}>
      <div
        className="flashcard-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ХЕДЕР */}
        <div className="flashcard-modal-header">
          <h3>Анализ текста</h3>
          <button className="flashcard-close-btn" onClick={closeModal}>
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

              {/* 2. СПИСОК ИДИОМ И КЛЮЧЕВЫХ ФРАЗ */}
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
                          onClick={() => handleCreateCard(phrase)}
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
          <button className="flashcard-btn-secondary" onClick={closeModal}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetPhrasesModal;
