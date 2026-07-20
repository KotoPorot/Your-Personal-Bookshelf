import React from 'react';
import './styles/BookNotesModal.css';

const BookNotesModal = ({ isOpen, onClose, notes, loading, onNoteClick, activeNoteId }) => {
    if (!isOpen) return null;

    // Проверяем, открыты ли сейчас детали (активна ли какая-то заметка)
    const isDetailOpen = !!activeNoteId;

    return (
        <div className="notes-overlay" onClick={onClose}>
            {/* Если детали открыты, добавляем класс затухания 'is-faded' */}
            <div className={`notes-drawer ${isDetailOpen ? 'is-faded' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="notes-drawer-header">
                    <h3>Заметки книги</h3>
                    <button className="notes-close-btn" onClick={onClose}>✕</button>
                </div>
                <div className="notes-list-container">
                    {loading ? (
                        <div className="notes-empty">Загрузка заметок...</div>
                    ) : notes.length === 0 ? (
                        <div className="notes-empty">
                            Заметок пока нет.<br />Выделите текст в книге, чтобы создать заметку!
                        </div>
                    ) : (
                        <ul className="notes-list">
                            {notes.map((note) => {
                                const isActive = activeNoteId === note.noteId;
                                return (
                                    <li
                                        key={note.noteId}
                                        onClick={() => onNoteClick(note)}
                                        className={`note-item ${isActive ? 'active-note' : ''}`}
                                    >
                                        <blockquote className="note-quote">
                                            {note.selectedText.length > 80
                                                ? `${note.selectedText.substring(0, 80)}...`
                                                : note.selectedText}
                                        </blockquote>
                                        {note.userNote && (
                                            <p className="note-comment-preview">
                                                <strong>Комментарий:</strong> {note.userNote}
                                            </p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookNotesModal;