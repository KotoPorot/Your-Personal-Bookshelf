import React from "react";

const StepExamples = ({
  examples = [],
  selectedExampleIds = [],
  onToggleExample,
  onRegenerateExample,
}) => {
  return (
    <div className="flashcard-step-examples">
      <div className="flashcard-section">
        <label className="flashcard-section-label">
          Примеры использования (выберите от 1 до 3):
        </label>
        <div className="flashcard-examples-list">
          {examples.map((example) => {
            const isSelected = selectedExampleIds.includes(example.id);
            return (
              <div
                key={example.id}
                className={`flashcard-example-item ${isSelected ? "selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleExample(example.id)}
                />

                <div
                  className="flashcard-example-content"
                  onClick={() => onToggleExample(example.id)}
                >
                  <div className="flashcard-example-front">{example.front}</div>
                  <div className="flashcard-example-back">{example.back}</div>
                </div>

                {onRegenerateExample && (
                  <button
                    type="button"
                    className="flashcard-refresh-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerateExample(example.id);
                    }}
                    title="Сгенерировать новый пример"
                  >
                    🔄
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepExamples;
