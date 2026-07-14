import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BookGrid from './BookGrid';
import BookModal from './BookModal';
import AddBookModal from './AddBookModal';
import { useAuth } from '../../context/AuthContext';
import { useBooks } from '../../context/BookContext';
import './styles/Bookshelf.css';

const Bookshelf = () => {
  // 1. Данные авторизации
  const { token, username, logout, openReader } = useAuth();

  // 2. Данные библиотеки и методы API
  const {
    shelves, books, activeShelfId, loading,
    selectShelf, createShelf, editShelfName, deleteShelf,
    addBookToState, renameBook, changeBookShelf, deleteBook
  } = useBooks();

  // 3. Чисто локальное состояние UI окон
  const [selectedBook, setSelectedBook] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- Легковесные обработчики UI (промпты и конфирмы остаются здесь) ---

  const handleCreateShelf = () => {
    const shelfName = prompt('Введите название новой полки:');
    if (shelfName && shelfName.trim() !== '') {
      createShelf(shelfName.trim());
    }
  };

  const handleEditShelf = (id) => {
    const currentShelf = shelves.find(s => s.id === id);
    const newName = prompt('Изменить название полки:', currentShelf?.shelfName);
    if (newName && newName.trim() !== '' && newName.trim() !== currentShelf?.shelfName) {
      editShelfName(id, newName.trim());
    }
  };

  const handleDeleteShelf = (id) => {
    const currentShelf = shelves.find(s => s.id === id);
    if (currentShelf && window.confirm(`Вы уверены, что хотите удалить полку "${currentShelf.shelfName}"?`)) {
      deleteShelf(id);
    }
  };

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleAddBook = (newBook) => {
    addBookToState(newBook);
    setIsAddModalOpen(false);
  };

  return (
    <div className="bookshelf-layout">
      <Header username={username} onLogout={logout} />

      <div className="bookshelf-main">
        <Sidebar
          shelves={shelves}
          activeShelfId={activeShelfId}
          onSelectShelf={selectShelf}
          onCreateShelf={handleCreateShelf}
          onEditShelf={handleEditShelf}
          onDeleteShelf={handleDeleteShelf}
        />

        <main className="bookshelf-content">
          <div className="content-header">
            <h2 className="shelf-title">
              {shelves.find(s => s.id === activeShelfId)?.shelfName || 'Полка не выбрана'}
            </h2>
            {activeShelfId && (
              <button
                className="add-book-btn"
                onClick={() => setIsAddModalOpen(true)}
              >
                ➕ Добавить книгу
              </button>
            )}
          </div>

          {loading ? (
            <div className="loader">Загрузка...</div>
          ) : (
            <BookGrid
              books={books}
              activeShelfId={activeShelfId}
              onBookClick={handleBookClick}
              token={token}
            />
          )}
        </main>
      </div>

      {/* Окно 1: Просмотр и редактирование существующей книги */}
      {selectedBook !== null && (
        <BookModal
          isOpen={true}
          book={selectedBook}
          shelves={shelves}
          token={token}
          onClose={() => setSelectedBook(null)}
          onUpdateBook={async (updatedData) => {
            if (updatedData.title !== selectedBook.title) {
              const updatedBook = await renameBook(selectedBook.id, updatedData.title);
              setSelectedBook(updatedBook || updatedData);
            }
            if (updatedData.shelfId !== selectedBook.shelfId) {
              await changeBookShelf(selectedBook.id, updatedData.shelfId);
              setSelectedBook(null);
            }
          }}
          onDeleteBook={deleteBook}
          onOpenReader={() => openReader(selectedBook)}
        />
      )}

      {/* Окно 2: Загрузка нового файла */}
      {isAddModalOpen && (
        <AddBookModal
          token={token}
          activeShelfId={activeShelfId}
          onClose={() => setIsAddModalOpen(false)}
          onUpload={handleAddBook}
        />
      )}
    </div>
  );
};

export default Bookshelf;