import { useReader } from "../context/ReaderContext";
import "./styles/NoteDetailModal.css";

const NoteDetailModal = () => {
	const { state, actions } = useReader();
	const { activeDetailNote } = state;

	if (!activeDetailNote) return null;

	return (
		<div className="note-detail-drawer" onClick={(e) => e.stopPropagation()}>
			<div className="note-detail-header">
				<h3>Детали заметки</h3>
				<button
					className="notes-close-btn"
					onClick={actions.handleCloseDetailNote}
				>
					✕
				</button>
			</div>

			<div className="note-detail-body">
				<div className="note-detail-section">
					<span className="note-detail-label">Выделенный текст</span>
					<blockquote className="note-detail-quote">
						{activeDetailNote.selectedText}
					</blockquote>
				</div>

				{activeDetailNote.userNote && (
					<div className="note-detail-section">
						<span className="note-detail-label">Ваш комментарий</span>
						<p className="note-detail-comment">{activeDetailNote.userNote}</p>
					</div>
				)}

				<div className="note-detail-date">
					Создано: {new Date(activeDetailNote.createdAt).toLocaleString()}
				</div>

				<div className="note-detail-actions">
					<button
						className="btn-navigate"
						onClick={() => actions.handleJumpToNote(activeDetailNote.cfi)}
					>
						🚀 Перейти к заметке
					</button>
					<button
						className="btn-delete"
						onClick={() => actions.handleDeleteNote(activeDetailNote.noteId)}
					>
						🗑 Удалить
					</button>
				</div>
			</div>
		</div>
	);
};

export default NoteDetailModal;
