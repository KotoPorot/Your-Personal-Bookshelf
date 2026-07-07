import React, { forwardRef, memo } from 'react';

const BookViewer = memo(forwardRef(({ loading, error, onPrev, onNext }, ref) => {
    return (
        <div className="viewer-wrapper" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {loading && <div className="reader-loading-spinner" style={{ padding: '20px', textAlign: 'center' }}>Загрузка книги...</div>}
            {error && <div className="reader-error-message" style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</div>}

            {/* Контейнер для epub.js — всегда в DOM, но скрывается при загрузке */}
            <div
                ref={ref}
                className="epub-viewer-container"
                style={{
                    flex: 1,
                    width: '100%',
                    display: 'block'
                }}
            />

            {/* ВОЗВРАЩАЕМ СИНИЕ КНОПКИ: Они рендерятся только когда книга загружена */}
            {!loading && !error && (
                <div className="nav-controls" style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '15px 0', background: '#f5f5f5' }}>
                    <button
                        onClick={onPrev}
                        className="btn-nav-blue"
                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Назад
                    </button>
                    <button
                        onClick={onNext}
                        className="btn-nav-blue"
                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Вперед
                    </button>
                </div>
            )}
        </div>
    );
}));

BookViewer.displayName = 'BookViewer';
export default BookViewer;