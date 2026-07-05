import React, { forwardRef } from 'react';

const BookViewer = forwardRef(({ loading, error, onPrev, onNext }, ref) => {
    return (
        <main className="reader-main">
            {loading && <div className="loading-message">Загрузка книги...</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Сюда epub.js будет встраивать iframe книги */}
            <div ref={ref} className="epub-viewer" />

            {/* Нижняя панель навигации */}
            <footer className="reader-footer">
                <button className="nav-btn" onClick={onPrev}>Назад</button>
                <button className="nav-btn" onClick={onNext}>Вперед</button>
            </footer>
        </main>
    );
});

// Назначаем имя для удобного отображения компонента в React DevTools
BookViewer.displayName = 'BookViewer';

export default BookViewer;