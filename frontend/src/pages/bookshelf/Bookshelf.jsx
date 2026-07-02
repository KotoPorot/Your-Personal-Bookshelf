import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import BookGrid from './BookGrid';
import BookModal from './BookModal';
import AddBookModal from './AddBookModal';
import { handleRequestError } from '../../utils/apiErrorHandler.js';
import './styles/Bookshelf.css';

const Bookshelf = ({ token, username, onLogout }) => {
    const [shelves, setShelves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeShelfId, setActiveShelfId] = useState(null);

    const [books, setBooks] = useState([]);

    // -- API useEffects
    useEffect(() => {
            const fetchShelves = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/v1/shelves/getAll', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                const data = response.data;
                    setShelves(data);
                    if (data.length > 0) {
                                    // Пытаемся взять ID из localStorage
                                    const savedShelfId = localStorage.getItem('lastSelectedShelfId');

                                    // Проверяем, существует ли полка с таким ID в полученных данных
                                    const exists = data.find(s => s.id === Number(savedShelfId));

                                    if (exists) {
                                        setActiveShelfId(exists.id);
                                    } else {
                                        // Если ID нет или его нет в списке (например, удалили полку), берем первую
                                        setActiveShelfId(data[0].id);
                                        localStorage.setItem('lastSelectedShelfId', data[0].id);
                                    }
                                }

                  }catch (err) {
                    handleRequestError(err, onLogout);
                } finally {
                    setLoading(false);
                }
            };

            if (token) { // Хорошая практика: проверять, есть ли токен
                fetchShelves();
            }
        }, [token]);

    useEffect(() => {
        const fetchBooks = async () => {
            if (!activeShelfId) return; // Не грузим, если полка еще не выбрана

            try {
                setLoading(true); // Можно включить лоадер, если есть
                const response = await axios.get(`http://localhost:8080/api/v1/books/getBooks/${activeShelfId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setBooks(response.data); // Обновляем список книг полученными данными
            } catch (err) {
                handleRequestError(err, onLogout);
            } finally {
                setLoading(false);
            }
        };

        if (token && activeShelfId!==null) {
            fetchBooks();
        }
    }, [token, activeShelfId]);

    // Разделяем управление окнами
    const [selectedBook, setSelectedBook] = useState(null); // Для просмотра/редактирования (объект или null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Для загрузки файлов (true/false)

    // Управление полками
    const handleCreateShelf = async () => {
        const shelfName = prompt('Введите название новой полки:');

        if (shelfName && shelfName.trim() !== '') {
            try {
                // Отправляем POST-запрос
                // Предполагаю, что контроллер принимает объект { shelfName: "..." }
                const response = await axios.post('http://localhost:8080/api/v1/shelves/createShelf',
                    { shelfName: shelfName.trim() },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Обновляем список полок, добавив новую, полученную с сервера
                // (response.data должен содержать объект созданной полки с новым ID)
                setShelves([...shelves, response.data]);

                // Опционально: делаем новую полку активной
                setActiveShelfId(response.data.id);

            } catch (err) {
                handleRequestError(err, onLogout);
            }
        }
    };

    const handleEditShelf = async (id) => {
        const currentShelf = shelves.find(s => s.id === id);
        const newName = prompt('Изменить название полки:', currentShelf.shelfName);

        if (newName && newName.trim() !== '' && newName.trim() !== currentShelf.shelfName) {
            try {
                // Отправляем PUT запрос
                const response = await axios.put(
                    `http://localhost:8080/api/v1/shelves/updateShelfName/${id}`,
                    { shelfName: newName.trim() }, // Тело запроса (DTO)
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Обновляем состояние, используя данные, которые вернул бэкенд
                setShelves(shelves.map(s => s.id === id ? response.data : s));

            } catch (err) {
                handleRequestError(err, onLogout);
            }
        }
    };

    const handleDeleteShelf = async (id) => {
        // Находим полку для подтверждения в диалоговом окне
        const currentShelf = shelves.find(s => s.id === id);
        if (!currentShelf) return;

        if (window.confirm(`Вы уверены, что хотите удалить полку "${currentShelf.shelfName}"?`)) {
            try {
                // Отправляем DELETE запрос
                await axios.delete(`http://localhost:8080/api/v1/shelves/deleteShelf/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Если запрос успешен (сервер ответил 204), обновляем стейт
                const updatedShelves = shelves.filter(s => s.id !== id);
                setShelves(updatedShelves);

                // Если удалили активную полку, переключаем на первую доступную
                if (activeShelfId === id) {
                    if (updatedShelves.length > 0) {
                        setActiveShelfId(updatedShelves[0].id);
                    } else {
                        setActiveShelfId(null); // Или другое значение, если полок больше нет
                    }
                }
            } catch (err) {
                handleRequestError(err, onLogout);
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

    return (
        <div className="bookshelf-layout">
            <Header username={username} onLogout={onLogout} />

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
                            {shelves.find(s => s.id === activeShelfId)?.shelfName || 'Полка не выбрана'}
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
                        token={token}
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