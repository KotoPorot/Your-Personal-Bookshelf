import React from "react";

const StepPhrases = ({
  phrases = [],
  selectedPhraseIds = [],
  customPhraseText = "",
  onTogglePhrase,
  onCustomTextChange,
}) => {
  return (
    <div className="flashcard-step-phrases">
      <div className="flashcard-section">
        <label className="flashcard-section-label">
          Найденные фразы (выберите нужное):
        </label>
        <div className="flashcard-phrase-list">
          {phrases.map((phrase) => {
            const isSelected = selectedPhraseIds.includes(phrase.id);
            return (
              <div
                key={phrase.id}
                className={`flashcard-phrase-item ${isSelected ? "selected" : ""}`}
                onClick={() => onTogglePhrase(phrase)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly /* Клик обрабатывается родителем div */
                />
                <div className="flashcard-phrase-info">
                  <div className="flashcard-phrase-text">{phrase.text}</div>
                  <div className="flashcard-phrase-translation">
                    {phrase.translation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flashcard-section">
        <label
          className="flashcard-section-label"
          htmlFor="custom-phrase-input"
        >
          Фраза на карточке (можно изменить):
        </label>
        <input
          id="custom-phrase-input"
          type="text"
          className="flashcard-input-field"
          value={customPhraseText}
          onChange={(e) => onCustomTextChange(e.target.value)}
          placeholder="Введите слово или фразу..."
        />
      </div>
    </div>
  );
};

export default StepPhrases;
