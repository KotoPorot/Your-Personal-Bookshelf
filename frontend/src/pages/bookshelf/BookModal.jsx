import React, { useState, useEffect, useRef } from 'react';

const BookModal = ({ isOpen, onClose, book, shelves, onUpdateBook, onDeleteBook, onOpenReader }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const [isMovingShelf, setIsMovingShelf] = useState(false);

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

    useEffect(() => {
        if (!isOpen) {
            setIsMovingShelf(false); // Сбрасываем вид при закрытии
            setShowMenu(false);      // Сбрасываем меню при закрытии
        }
    }, [isOpen]);

    if (!isOpen || !book) return null;

    // Имитируем новые поля, если их пока нет в объекте книги (для тестов)
    const readPages = book.readPages || 0;
    const totalPages = book.pages || 0;
    const readingHours = book.readingHours || 0;

    // Расчет прогресса в процентах
    const progressPercent = totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0;

    // Находим название полки по её ID
    const currentShelf = shelves.find(s => Number(s.id) === Number(book.shelfId));
    console.log('currentShelf:', currentShelf)
    const shelfName = currentShelf ? currentShelf.shelfName : 'Без полки';
    console.log('currentShelf name: ', shelfName)

    // Обработчики действий из шестерёнки
    const handleRename = () => {
        const newTitle = prompt('Введите новое название книги:', book.title);
        if (newTitle && newTitle.trim() !== '') {
            onUpdateBook({ ...book, title: newTitle.trim() });
        }
        setShowMenu(false);
    };

    const handleMoveShelf = () => {
        setIsMovingShelf(true);
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
                    {isMovingShelf ? (
                            // Вид выбора полки
                            <div className="shelf-selection-view">
                                <div className="selection-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <button
                                        onClick={() => setIsMovingShelf(false)}
                                        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}
                                    >
                                        ← Назад
                                    </button>
                                    <h3 style={{ margin: 0 }}>Переместить на полку:</h3>
                                </div>

                                <div className="shelf-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {(shelves || [])
                                        // Сортируем: текущая полка всегда идет первой (-1)
                                        .sort((a, b) => {
                                            if (Number(a.id) === Number(book.shelfId)) return -1;
                                            if (Number(b.id) === Number(book.shelfId)) return 1;
                                            return 0;
                                        })
                                        .map(shelf => {
                                            const isCurrent = Number(shelf.id) === Number(book.shelfId);
                                            return (
                                                <button
                                                    key={shelf.id}
                                                    className="shelf-option-item"
                                                    disabled={isCurrent} // Делаем кнопку неактивной
                                                    onClick={() => {
                                                        onUpdateBook({ ...book, shelfId: shelf.id });
                                                        setIsMovingShelf(false);
                                                    }}
                                                    style={{
                                                        padding: '10px',
                                                        textAlign: 'left',
                                                        borderRadius: '6px',
                                                        border: '1px solid #ddd',
                                                        // Стили для текущей полки (серая и некликабельная)
                                                        opacity: isCurrent ? 0.6 : 1,
                                                        cursor: isCurrent ? 'not-allowed' : 'pointer',
                                                        backgroundColor: isCurrent ? '#f9f9f9' : 'white',
                                                        color: isCurrent ? '#888' : 'black'
                                                    }}
                                                >
                                                    {isCurrent ? '📁 ' + shelf.shelfName + ' (текущая)' : '📁 ' + shelf.shelfName}
                                                </button>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                  ) : (

                      <>
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
                    </>
                    )}
                </div>


                {/* Подвал с будущими фичами */}
                {!isMovingShelf && (
                <div className="modal-footer">
                    <button
                        className="btn btn-secondary notes-btn"
                        onClick={() => alert('Фича "Заметки" в разработке')}
                    >
                        📝 Заметки
                    </button>
                    <button
                        className="btn btn-primary read-btn"
                        onClick={() => {
                            onOpenReader(book.id);
                            onClose();
                            }}
                    >
                        📖 Читать
                    </button>
                </div>
                )}

            </div>
        </div>
    );
};

export default BookModal;