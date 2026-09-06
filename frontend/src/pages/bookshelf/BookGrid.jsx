import BookCard from "./BookCard";

const BookGrid = ({ books, activeShelfId, onBookClick, token }) => {
	// Фильтруем книги по активной полке
	const filteredBooks = books.filter((book) => book.shelfId === activeShelfId);

	return (
		<div className="book-grid">
			{filteredBooks.map((book) => (
				<BookCard
					key={book.id}
					book={book}
					onBookClick={onBookClick}
					token={token}
				/>
			))}
			{filteredBooks.map((book) => (
				<BookCard
					key={book.id}
					book={book}
					onBookClick={onBookClick}
					token={token}
				/>
			))}
			{/* tempolar */}

			{filteredBooks.length > 0 ? (
				filteredBooks.map((book) => (
					<BookCard
						key={book.id}
						book={book}
						onBookClick={onBookClick}
						token={token}
					/>
				))
			) : (
				<p className="empty-shelf-message">На этой полке пока нет книг</p>
			)}
		</div>
	);
};

export default BookGrid;
