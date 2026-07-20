import React from 'react';
import { useReader } from '../context/ReaderContext';

const SelectionMenu = () => {
    const { state, actions } = useReader();
    const { visible, top, left } = state.selectionMenu;

    if (!visible) return null;

    return (
        <div
            className="selection-floating-menu"
            onClick={(e) => e.stopPropagation()}
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
            <button onClick={actions.openNoteModal} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                📝 Заметка
            </button>
            <span style={{ color: '#555' }}>|</span>
            <button onClick={() => alert('Функция перевода будет доступна позже!')} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '13px' }}>
                🌐 Перевести (заглушка)
            </button>
        </div>
    );
};

export default SelectionMenu;