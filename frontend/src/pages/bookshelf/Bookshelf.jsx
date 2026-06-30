import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BookGrid from './BookGrid';
import BookModal from './BookModal';
import AddBookModal from './AddBookModal'; // Импортируем новую модалку загрузки
import './styles/Bookshelf.css';

const Bookshelf = ({ token, onLogout }) => {
    const [shelves, setShelves] = useState([
        { id: 1, name: 'Читаю сейчас' },
        { id: 2, name: 'Хочу прочитать' },
        { id: 3, name: 'Прочитано' }
    ]);
    const [activeShelfId, setActiveShelfId] = useState(1);

    const [books, setBooks] = useState([
        { id: 1, shelfId: 1, title: 'Чистый код', author: 'Роберт Мартин', pages: 464, status: 'reading', description: 'Легендарная книга об искусстве написания кода.' },
        { id: 2, shelfId: 1, title: 'Совершенный код', author: 'Стив Макконнелл', pages: 896, status: 'reading', description: 'Практическое руководство по созданию качественного ПО.' },
        { id: 3, shelfId: 2, title: 'Грокаем алгоритмы', author: 'Адитья Бхаргава', pages: 288, status: 'planned', description: 'Иллюстрированное руководство для программистов.' },
        { id: 4, shelfId: 3, title: 'Паттерны проектирования', author: 'Эрик Фримен', pages: 656, status: 'completed', description: 'Классические приемы ООП.' }
    ]);

    // Разделяем управление окнами
    const [selectedBook, setSelectedBook] = useState(null); // Для просмотра/редактирования (объект или null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Для загрузки файлов (true/false)

    // Управление полками
    const handleCreateShelf = () => {
        const name = prompt('Введите название новой полки:');
        if (name && name.trim() !== '') {
            setShelves([...shelves, { id: Date.now(), name: name.trim() }]);
        }
    };

    const handleEditShelf = (id) => {
        const currentShelf = shelves.find(s => s.id === id);
        const newName = prompt('Изменить название полки:', currentShelf.name);
        if (newName && newName.trim() !== '') {
            setShelves(shelves.map(s => s.id === id ? { ...s, name: newName.trim() } : s));
        }
    };

    const handleDeleteShelf = (id) => {
        const currentShelf = shelves.find(s => s.id === id);
        if (window.confirm(`Вы уверены, что хотите удалить полку "${currentShelf.name}"?`)) {
            setShelves(shelves.filter(s => s.id !== id));
            if (activeShelfId === id) {
                const remaining = shelves.filter(s => s.id !== id);
                if (remaining.length > 0) setActiveShelfId(remaining[0].id);
            }
        }
    };

    // Сохранение отредактированной книги
    const handleBookClick = (book) => {
        console.log("Клик получен в Bookshelf, книга:", book); // Добавь это!
        setSelectedBook(book); // Устанавливаем книгу, чтобы модалка знала, что показывать
    };

    // Добавление новой загруженной книги
    const handleAddBook = (newBook) => {
        setBooks([...books, newBook]);
        setIsAddModalOpen(false); // Закрываем окно загрузки
    };
console.log("Текущая книга в стейте:", selectedBook);

    return (
        <div className="bookshelf-layout">
            <Header onLogout={onLogout} />

            <div className="bookshelf-main">
                <Sidebar
                    shelves={shelves}
                    activeShelfId={activeShelfId}
                    onSelectShelf={setActiveShelfId}
                    onCreateShelf={handleCreateShelf}
                    onEditShelf={handleEditShelf}
                    onDeleteShelf={handleDeleteShelf}
                />

                <main className="bookshelf-content">
                    <div className="content-header">
                        <h2 className="shelf-title">
                            {shelves.find(s => s.id === activeShelfId)?.name || 'Полка не выбрана'}
                        </h2>
                        {activeShelfId && (
                            <button
                                className="add-book-btn"
                                onClick={() => setIsAddModalOpen(true)} // Открываем окно загрузки файлов
                            >
                                ➕ Добавить книгу
                            </button>
                        )}
                    </div>

                    <BookGrid
                        books={books}
                        activeShelfId={activeShelfId}
                        onBookClick={handleBookClick}
                    />
                </main>
            </div>

            {/* Окно 1: Просмотр и редактирование существующей книги */}
            {selectedBook !== null && (
                <BookModal
                    isOpen={true}
                    book={selectedBook}
                    shelves={shelves}
                    onClose={() => setSelectedBook(null)}
                />
            )}

            {/* Окно 2: Загрузка нового файла */}
            {isAddModalOpen && (
                <AddBookModal
                    activeShelfId={activeShelfId}
                    onClose={() => setIsAddModalOpen(false)}
                    onUpload={handleAddBook}
                />
            )}
        </div>
    );
};

export default Bookshelf;