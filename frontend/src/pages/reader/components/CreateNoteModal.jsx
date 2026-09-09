import { useReader } from "../context/ReaderContext";

const CreateNoteModal = () => {
	const { state, actions } = useReader();
	const { isNoteModalOpen, selectionMenu, noteComment } = state;
	const { closeNoteModal, setNoteComment, handleSaveNote } = actions;

	if (!isNoteModalOpen) return null;

	return (
		<div
			className="modal-overlay"
			onClick={closeNoteModal}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: "rgba(0,0,0,0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1100,
			}}
		>
			<div
				className="modal-content"
				onClick={(e) => e.stopPropagation()}
				style={{
					background: "#fff",
					padding: "24px",
					borderRadius: "12px",
					width: "90%",
					maxWidth: "500px",
					color: "#333",
				}}
			>
				<h3>Создать заметку</h3>

				<blockquote
					style={{
						borderLeft: "4px solid #007bff",
						paddingLeft: "12px",
						color: "#666",
						fontStyle: "italic",
						margin: "16px 0",
						maxHeight: "100px",
						overflowY: "auto",
					}}
				>
					"{selectionMenu.text}"
				</blockquote>

				<textarea
					placeholder="Ваш комментарий к тексту..."
					value={noteComment}
					onChange={(e) => setNoteComment(e.target.value)}
					style={{
						width: "100%",
						height: "100px",
						padding: "8px",
						borderRadius: "6px",
						border: "1px solid #ccc",
						resize: "none",
						boxSizing: "border-box",
					}}
				/>

				<div
					style={{
						display: "flex",
						justifyContent: "flex-end",
						gap: "12px",
						marginTop: "16px",
					}}
				>
					<button
						onClick={closeNoteModal}
						style={{
							padding: "8px 16px",
							background: "#e0e0e0",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
						}}
					>
						Отмена
					</button>
					<button
						onClick={handleSaveNote}
						style={{
							padding: "8px 16px",
							background: "#007bff",
							color: "#fff",
							border: "none",
							borderRadius: "6px",
							cursor: "pointer",
						}}
					>
						Сохранить
					</button>
				</div>
			</div>
		</div>
	);
};

export default CreateNoteModal;
