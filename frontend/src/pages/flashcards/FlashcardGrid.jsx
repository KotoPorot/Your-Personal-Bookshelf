import React from "react";
import FlashcardCard from "./FlashcardCard";

const FlashcardGrid = ({ cards, activeFolderId, onCardClick }) => {
  // Фильтруем карточки по активной папке
  const filteredCards = cards.filter(
    (card) => Number(card.folderId) === Number(activeFolderId),
  );

  return (
    <div className="book-grid">
      {filteredCards.length > 0 ? (
        filteredCards.map((card) => (
          <FlashcardCard key={card.id} card={card} onClick={onCardClick} />
        ))
      ) : (
        <p className="empty-shelf-message">В этой папке пока нет карточек</p>
      )}
    </div>
  );
};

export default FlashcardGrid;
