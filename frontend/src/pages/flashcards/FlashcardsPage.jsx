import React, { useState } from "react";
import Header from "../bookshelf/Header";
import FlashcardsSidebar from "./FlashcardsSidebar";
import FlashcardGrid from "./FlashcardGrid";
import FlashcardModal from "./FlashcardModal";
import { useAuth } from "../../context/AuthContext";
import "../bookshelf/styles/Bookshelf.css";

const FlashcardsPage = () => {
  const { username, logout } = useAuth();

  const [folders, setFolders] = useState([
    { id: 1, name: "Словарь: Глава 1" },
    { id: 2, name: "Термины IT" },
  ]);
  const [activeFolderId, setActiveFolderId] = useState(1);

  const [cards, setCards] = useState([
    {
      id: 101,
      folderId: 1,
      phrase: "speak up",
      phraseTranslation: "высказаться",
      targetLanguage: "ru",
      definition: "talk louder so that other people can hear you clearly",
      examples: [
        {
          sentence: "Could you please speak up because I cannot hear you?",
          clozeSentence: "Could you please ___ ___ because I cannot hear you?",
          translation:
            "Не могли бы вы говорить громче, потому что я вас не слышу?",
        },
        {
          sentence: "If you disagree with the decision, you must speak up now.",
          clozeSentence:
            "If you disagree with the decision, you must ___ ___ now.",
          translation:
            "Если вы не согласны с решением, вы должны высказаться сейчас.",
        },
        {
          sentence:
            "She always speaks up for her friends when they are bullied.",
          clozeSentence:
            "She always ___ ___ for her friends when they are bullied.",
          translation:
            "Она всегда заступается за своих друзей, когда над ними издеваются.",
        },
      ],
    },
  ]);

  const [selectedCard, setSelectedCard] = useState(null);

  // --- Управление Папками ---
  const handleCreateFolder = () => {
    const name = prompt("Введите название новой папки:");
    if (name && name.trim() !== "") {
      const newFolder = { id: Date.now(), name: name.trim() };
      setFolders([...folders, newFolder]);
      setActiveFolderId(newFolder.id);
    }
  };

  const handleEditFolder = (id) => {
    const folder = folders.find((f) => f.id === id);
    const newName = prompt("Изменить название папки:", folder?.name);
    if (newName && newName.trim() !== "") {
      setFolders(
        folders.map((f) => (f.id === id ? { ...f, name: newName.trim() } : f)),
      );
    }
  };

  const handleDeleteFolder = (id) => {
    if (window.confirm("Удалить папку со всеми карточками?")) {
      setFolders(folders.filter((f) => f.id !== id));
      setCards(cards.filter((c) => c.folderId !== id));
      if (activeFolderId === id) {
        setActiveFolderId(folders[0]?.id || null);
      }
    }
  };

  // ⚠️ Временная заглушка для добавления карточки
  const handleAddCard = () => {
    alert("Форма создания карточки находится в разработке");
  };

  const handleUpdateCard = (updatedCard) => {
    setCards(cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    setSelectedCard(updatedCard);
  };

  const handleDeleteCard = (cardId) => {
    setCards(cards.filter((c) => c.id !== cardId));
    setSelectedCard(null);
  };

  return (
    <div className="bookshelf-layout">
      <Header username={username} onLogout={logout} />

      <div className="bookshelf-main">
        <FlashcardsSidebar
          folders={folders}
          activeFolderId={activeFolderId}
          onSelectFolder={setActiveFolderId}
          onCreateFolder={handleCreateFolder}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
        />

        <main className="bookshelf-content">
          <div className="content-header">
            <h2 className="shelf-title">
              {folders.find((f) => f.id === activeFolderId)?.name ||
                "Папка не выбрана"}
            </h2>
            {activeFolderId && (
              <button className="add-book-btn" onClick={handleAddCard}>
                ➕ Добавить карточку
              </button>
            )}
          </div>

          <FlashcardGrid
            cards={cards}
            activeFolderId={activeFolderId}
            onCardClick={setSelectedCard}
          />
        </main>
      </div>

      {selectedCard && (
        <FlashcardModal
          isOpen={true}
          card={selectedCard}
          folders={folders}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}
    </div>
  );
};

export default FlashcardsPage;
