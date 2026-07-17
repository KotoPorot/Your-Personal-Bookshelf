import React from 'react';
import './styles/NoteDetailModal.css';

const NoteDetailModal = ({ isOpen, onClose, note, onNavigate, onDelete }) => {
    if (!isOpen || !note) return null;

    return (
        <div className="note-detail-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="note-detail-header">
                <h3>Детали заметки</h3>
                <button className="notes-close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="note-detail-body">
                <div className="note-detail-section">
                    <span className="note-detail-label">Выделенный текст</span>
                    <blockquote className="note-detail-quote">
                        {note.selectedText}
                    </blockquote>
                </div>

                {note.userNote && (
                    <div className="note-detail-section">
                        <span className="note-detail-label">Ваш комментарий</span>
                        <p className="note-detail-comment">{note.userNote}</p>
                    </div>
                )}

                <div className="note-detail-date">
                    Создано: {new Date(note.createdAt).toLocaleString()}
                </div>

                <div className="note-detail-actions">
                    <button className="btn-navigate" onClick={() => onNavigate(note.cfi)}>
                        🚀 Перейти к книге
                    </button>
                    <button className="btn-delete" onClick={() => onDelete(note.noteId)}>
                        🗑 Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteDetailModal;