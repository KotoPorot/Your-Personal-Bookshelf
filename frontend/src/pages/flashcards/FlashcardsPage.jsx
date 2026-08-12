import React, { useState } from "react";
import Header from "../bookshelf/Header";
import FlashcardsSidebar from "./FlashcardsSidebar";
import FlashcardGrid from "./FlashcardGrid";
import FlashcardModal from "./FlashcardModal";
import { useAuth } from "../../context/AuthContext";
import { useFolder } from "../../context/FolderContext"; // <--- Подключили контекст папок
import "../bookshelf/styles/Bookshelf.css";

const FlashcardsPage = () => {
  const { username, logout } = useAuth();

  // Используем состояние папок из контекста
  const {
    folders,
    activeFolderId,
    setActiveFolderId,
    createFolder,
    updateFolder,
    deleteFolder,
    loading,
    error,
  } = useFolder();

  // Моковые карточки пока оставляем в локальном стейте
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
      ],
    },
  ]);

  const [selectedCard, setSelectedCard] = useState(null);

  // --- Управление Папками с обработкой асинхронных вызовов ---
  const handleCreateFolder = async () => {
    const name = prompt("Введите название новой папки:");
    if (name && name.trim() !== "") {
      try {
        await createFolder(name.trim());
      } catch (err) {
        alert("Ошибка при создании папки: " + err.message);
      }
    }
  };

  const handleEditFolder = async (id) => {
    const folder = folders.find((f) => f.id === id);
    const newName = prompt("Изменить название папки:", folder?.name);
    if (newName && newName.trim() !== "" && newName !== folder?.name) {
      try {
        await updateFolder(id, newName.trim());
      } catch (err) {
        alert("Ошибка при обновлении папки: " + err.message);
      }
    }
  };

  const handleDeleteFolder = async (id) => {
    if (window.confirm("Удалить папку со всеми карточками?")) {
      try {
        await deleteFolder(id);
        // Также чистим локальные карточки этой папки
        setCards((prevCards) => prevCards.filter((c) => c.folderId !== id));
      } catch (err) {
        alert("Ошибка при удалении папки: " + err.message);
      }
    }
  };

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
        {loading && <div className="loading-bar">Загрузка папок...</div>}
        {error && <div className="error-banner">{error}</div>}

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
