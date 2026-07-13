import React from 'react';

const SelectionMenu = ({ visible, top, left, onCreateNote, onTranslate }) => {
    if (!visible) return null;

    return (
        <div
            className="selection-floating-menu"
            onClick={(e) => e.stopPropagation()} // ДОБАВЛЕНО: Клик по меню не будет закрывать читалку или сбрасывать фокус книги
            style={{
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                transform: 'translateX(-50%)',
                zIndex: 1000,
                display: 'flex',
                gap: '8px',
                background: '#222',
                padding: '6px 12px',
                borderRadius: '8px',
                boxShadow: '0px 4px 12px rgba(0,0,0,0.3)'
            }}
        >
            <button onClick={onCreateNote} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                📝 Заметка
            </button>
            <span style={{ color: '#555' }}>|</span>
            <button onClick={onTranslate} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '13px' }}>
                🌐 Перевести (заглушка)
            </button>
        </div>
    );
};

export default SelectionMenu; // ДОБАВЛЕНО: Экспорт компонента