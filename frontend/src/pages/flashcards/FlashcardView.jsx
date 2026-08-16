import React, { useState } from "react";

const FlashcardView = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) return null;

  return (
    <div
      className={`flashcard-box ${isFlipped ? "flipped" : ""}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {!isFlipped ? (
        /* ЛИЦЕВАЯ СТОРОНА */
        <div>
          <div className="flashcard-badge front">Лицевая сторона</div>

          <div className="flashcard-main-block">
            <div className="flashcard-title">{card.definition}</div>
          </div>

          <div>
            <span className="flashcard-section-label">
              Примеры (с пропусками):
            </span>
            <div className="flashcard-examples-list">
              {card.examples?.map((ex, idx) => (
                <div key={ex.id || idx} className="flashcard-example-item">
                  <div className="flashcard-example-text">
                    {/* Исправлено: поддержка безлишних полей JSON */}
                    {ex.withoutTargetWord || ex.clozeSentence}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ОБРАТНАЯ СТОРОНА */
        <div>
          <div className="flashcard-badge back">Обратная сторона</div>

          <div className="flashcard-main-block">
            <div className="flashcard-title">{card.phrase}</div>
            {card.phraseTranslation && (
              <div className="flashcard-subtitle">{card.phraseTranslation}</div>
            )}
          </div>

          <div>
            <span className="flashcard-section-label">
              Полные предложения и перевод:
            </span>
            <div className="flashcard-examples-list">
              {card.examples?.map((ex, idx) => (
                <div key={ex.id || idx} className="flashcard-example-item">
                  <div className="flashcard-example-text">
                    {/* Исправлено: поддержка безлишних полей JSON */}
                    {ex.example || ex.sentence}
                  </div>
                  {ex.translation && (
                    <div className="flashcard-example-translation">
                      {ex.translation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardView;
