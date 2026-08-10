import React from "react";

const FlashcardCard = ({ card, onClick }) => {
  // Защита: если card не передан или равен null
  if (!card) return null;

  // Безопасно извлекаем данные (работает и со старой структурой front/back, и с новой)
  const title = card.phrase || card.front || "Без названия";
  const subtitle = card.phraseTranslation || card.back || "";
  const description = card.definition || "";
  const examplesCount = Array.isArray(card.examples) ? card.examples.length : 0;

  return (
    <div
      className="book-card flashcard-item"
      onClick={() => onClick && onClick(card)}
      style={{ padding: "16px", cursor: "pointer" }}
    >
      <div className="card-header" style={{ marginBottom: "10px" }}>
        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#007bff" }}>
          {title}
        </h3>
        {subtitle && (
          <span
            style={{
              fontSize: "0.9rem",
              color: "#6c757d",
              fontStyle: "italic",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>

      {description && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "#495057",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            margin: "0 0 10px 0",
          }}
        >
          {description}
        </p>
      )}

      <div style={{ fontSize: "0.75rem", color: "#888", textAlign: "right" }}>
        Примеров: {examplesCount}
      </div>
    </div>
  );
};

export default FlashcardCard;
