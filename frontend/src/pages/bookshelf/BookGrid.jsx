import React from 'react';
import BookCard from './BookCard'; // или правильный путь к карточке

const BookGrid = ({ books, activeShelfId, onBookClick, token }) => {
        console.log("Все книги:", books);
        console.log("Активная полка:", activeShelfId);
    // Фильтруем книги по активной полке
    const filteredBooks = books.filter(book => book.shelfId === activeShelfId);

    return (
        <div className="book-grid">
            {filteredBooks.length > 0 ? (
                filteredBooks.map(book => (
                    <BookCard
                        key={book.id}
                        book={book}
                        // КРИТИЧЕСКИ ВАЖНО: передаем функцию клика дальше в карточку!
                        onBookClick={onBookClick}
                        token = {token}
                    />
                ))
            ) : (
                <p className="empty-shelf-message">На этой полке пока нет книг</p>
            )
        }
        </div>
    );
};

export default BookGrid;