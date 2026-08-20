import React, { useState, useEffect } from "react";
import axios from "axios";

const BookCard = ({ book, onBookClick, token }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const placeholderCover =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5NiAxNDQiIGZpbGw9Im5vbmUiPjxyZWN0IHdpZHRoPSI5NiIgaGVpZ2h0PSIxNDQiIGZpbGw9IiNFREYyRjciLz48cGF0aCBkPSJNMzIgNDhINjRWMTEySDMyVjQ4WiIgZmlsbD0id2hpdGUiIHN0cm9rZT0iIzcxODBONiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTQ0IDYwaDRWMTAwaDRWMTAwSDQ0VjYwWiIgZmlsbD0iIzcxODBONiIvPjwvc3ZnPg==";

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        // Если нет токена или ID, сразу выходим
        if (!token || !book.id) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `https://your-personal-bookshelf.onrender.com/api/v1/books/getCoverImage/${book.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          },
        );

        if (isMounted) {
          setImageUrl(URL.createObjectURL(response.data));
        }
      } catch (err) {
        console.error("Не удалось загрузить обложку для:", book.title, err);
        // imageUrl остается null, что приведет к показу placeholder
      } finally {
        // ВАЖНО: всегда выключаем loading, даже при ошибке
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [book.id, token]);

  return (
    <div className="book-card" onClick={() => onBookClick(book)}>
      <div className="book-card-cover-wrapper">
        <img
          src={imageUrl || placeholderCover}
          alt={`Обложка книги ${book.title}`}
          className="book-card-cover-image"
        />
      </div>
      <div className="book-card-info">
        <h4 className="book-card-title">{book.title}</h4>
        <p className="book-card-author">{book.author}</p>
        <div className="book-card-footer">
          <span className="book-card-pages">{book.pages} стр.</span>
          <span className={`status-badge ${book.status}`}>
            {book.status === "reading" && "Читаю"}
            {book.status === "planned" && "В планах"}
            {book.status === "completed" && "Прочитано"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
