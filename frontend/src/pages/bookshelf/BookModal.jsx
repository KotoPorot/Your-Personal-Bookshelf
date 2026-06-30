import React, { useState, useEffect, useRef } from 'react';

const BookModal = ({ isOpen, onClose, book, shelves, onUpdateBook, onDeleteBook }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Закрываем меню шестерёнки при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    if (!isOpen || !book) return null;

    // Имитируем новые поля, если их пока нет в объекте книги (для тестов)
    const readPages = book.readPages || 0;
    const totalPages = book.pages || 0;
    const readingHours = book.readingHours || 0;

    // Расчет прогресса в процентах
    const progressPercent = totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0;

    // Находим название полки по её ID
    const currentShelf = shelves.find(s => s.id === book.shelfId);
    const shelfName = currentShelf ? currentShelf.name : 'Без полки';

    // Обработчики действий из шестерёнки
    const handleRename = () => {
        const newTitle = prompt('Введите новое название книги:', book.title);
        if (newTitle && newTitle.trim() !== '') {
            onUpdateBook({ ...book, title: newTitle.trim() });
        }
        setShowMenu(false);
    };

    const handleMoveShelf = () => {
        const shelfOptions = shelves
            .map((s, idx) => `${idx + 1}. ${s.name}`)
            .join('\n');

        const choice = prompt(`Выберите номер полки для перемещения:\n\n${shelfOptions}`);
        const selectedIndex = parseInt(choice, 10) - 1;

        if (selectedIndex >= 0 && selectedIndex < shelves.length) {
            const targetShelf = shelves[selectedIndex];
            onUpdateBook({ ...book, shelfId: targetShelf.id });
        }
        setShowMenu(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Вы уверены, что хотите удалить книгу "${book.title}"?`)) {
            onDeleteBook(book.id);
            onClose();
        }
        setShowMenu(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="book-info-modal" onClick={(e) => e.stopPropagation()}>

                {/* Шапка модалки с кнопками управления */}
                <div className="modal-header">
                    <div className="settings-container" ref={menuRef}>
                        <button
                            className="icon-button settings-btn"
                            onClick={() => setShowMenu(!showMenu)}
                            title="Управление книгой"
                        >
                            ⚙️
                        </button>

                        {/* Выпадающее меню шестерёнки */}
                        {showMenu && (
                            <div className="settings-dropdown">
                                <button onClick={handleRename}>✏️ Переименовать</button>
                                <button onClick={handleMoveShelf}>📁 Переместить</button>
                                <button onClick={handleDelete} className="delete-action">🗑️ Удалить</button>
                            </div>
                        )}
                    </div>

                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>

                {/* Основной контент (Информационный) */}
                <div className="modal-body">
                    <h2 className="book-modal-title">{book.title}</h2>

                    <div className="book-info-grid">
                        <div className="info-row">
                            <span className="info-label">Автор:</span>
                            <span className="info-value">{book.author || 'Не указан'}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Полка:</span>
                            <span className="info-value shelf-highlight">{shelfName}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Всего страниц:</span>
                            <span className="info-value">{totalPages}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Прочитано страниц:</span>
                            <span className="info-value">{readPages}</span>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Прогресс:</span>
                            <div className="progress-value-wrapper">
                                <span className="info-value">{progressPercent}%</span>
                                <div className="mini-progress-bar">
                                    <div className="mini-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="info-row">
                            <span className="info-label">Время в чтении:</span>
                            <span className="info-value">{readingHours} ч.</span>
                        </div>
                    </div>
                </div>

                {/* Подвал с будущими фичами */}
                <div className="modal-footer">
                    <button
                        className="btn btn-secondary notes-btn"
                        onClick={() => alert('Фича "Заметки" в разработке')}
                    >
                        📝 Заметки
                    </button>
                    <button
                        className="btn btn-primary read-btn"
                        onClick={() => alert('Фича "Читалка" в разработке')}
                    >
                        📖 Читать
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BookModal;