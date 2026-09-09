import { useState, useEffect, useRef } from "react";
import FlashcardView from "./FlashcardView";
import { useFlashcards } from "../../context/FlashcardContext";
import EditFlashcardForm from "./EditFlashcardForm";
import "./FlashcardModal.css";

const FlashcardModal = ({ isOpen, onClose, card, folders }) => {
	const { cards, moveCard, deleteCard } = useFlashcards();
	const [showMenu, setShowMenu] = useState(false);
	const [mode, setMode] = useState("VIEW"); // 'VIEW', 'MOVE', 'EDIT'
	const [loadingAction, setLoadingAction] = useState(false);
	const menuRef = useRef(null);

	const activeCard = cards.find((c) => c.id === card?.id) || card;

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setShowMenu(false);
			}
		};
		if (showMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showMenu]);

	useEffect(() => {
		if (!isOpen) {
			setMode("VIEW");
			setShowMenu(false);
		}
	}, [isOpen]);

	if (!isOpen || !activeCard) return null;

	const currentFolder = folders.find(
		(f) =>
			Number(f.id) === Number(activeCard.folderId || activeCard.folder?.id),
	);
	const folderName = currentFolder ? currentFolder.name : "Без папки";

	const handleEditContent = () => {
		setShowMenu(false);
		setMode("EDIT");
	};

	const handleMoveFolder = async (newFolderId) => {
		setLoadingAction(true);
		try {
			await moveCard(activeCard.id, newFolderId);
			setMode("VIEW");
		} catch (err) {
			console.error("Ошибка при перемещении карточки:", err);
		} finally {
			setLoadingAction(false);
		}
	};

	const handleDelete = async () => {
		setShowMenu(false);
		if (window.confirm(`Удалить карточку "${activeCard.phrase}"?`)) {
			setLoadingAction(true);
			try {
				await deleteCard(activeCard.id);
				onClose();
			} catch (err) {
				console.error("Ошибка при удалении карточки:", err);
			} finally {
				setLoadingAction(false);
			}
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="book-info-modal flashcard-modal-container"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Отображаем верхнюю шапку ТОЛЬКО если не в режиме редактирования */}
				{mode !== "EDIT" && (
					<div className="modal-header">
						<div className="settings-container" ref={menuRef}>
							<button
								className="icon-button settings-btn"
								onClick={() => setShowMenu(!showMenu)}
								title="Управление карточкой"
								disabled={loadingAction}
							>
								⚙️
							</button>

							{showMenu && (
								<div className="settings-dropdown">
									<button onClick={handleEditContent}>✏️ Редактировать</button>
									<button
										onClick={() => {
											setMode("MOVE");
											setShowMenu(false);
										}}
									>
										📁 Переместить
									</button>
									<button onClick={handleDelete} className="delete-action">
										🗑️ Удалить
									</button>
								</div>
							)}
						</div>

						<button className="close-button" onClick={onClose}>
							&times;
						</button>
					</div>
				)}

				{/* Тело модального окна */}
				<div className="modal-body">
					{mode === "EDIT" && (
						<EditFlashcardForm
							card={activeCard}
							folders={folders}
							onCancel={() => setMode("VIEW")}
							onSuccess={() => setMode("VIEW")}
						/>
					)}

					{mode === "MOVE" && (
						<div className="shelf-selection-view">
							<div
								className="selection-header"
								style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
							>
								<button
									onClick={() => setMode("VIEW")}
									style={{
										background: "none",
										border: "none",
										color: "#007bff",
										cursor: "pointer",
									}}
								>
									← Назад
								</button>
								<h3 style={{ margin: 0 }}>Переместить в папку:</h3>
							</div>

							<div
								className="shelf-list"
								style={{ display: "flex", flexDirection: "column", gap: "8px" }}
							>
								{folders.map((folder) => {
									const activeFolderId =
										activeCard.folderId || activeCard.folder?.id;
									const isCurrent =
										Number(folder.id) === Number(activeFolderId);
									return (
										<button
											key={folder.id}
											disabled={isCurrent || loadingAction}
											onClick={() => handleMoveFolder(folder.id)}
											style={{
												padding: "10px",
												textAlign: "left",
												borderRadius: "6px",
												border: "1px solid #ddd",
												opacity: isCurrent || loadingAction ? 0.6 : 1,
												cursor:
													isCurrent || loadingAction
														? "not-allowed"
														: "pointer",
											}}
										>
											{isCurrent
												? `📁 ${folder.name} (текущая)`
												: `📁 ${folder.name}`}
										</button>
									);
								})}
							</div>
						</div>
					)}

					{mode === "VIEW" && (
						<div className="flashcard-preview-container">
							<div style={{ marginBottom: "12px" }}>
								<span className="info-label">
									Папка: <strong>{folderName}</strong>
								</span>
							</div>

							<FlashcardView card={activeCard} />

							<span className="flashcard-hint">
								💡 Нажмите на карточку, чтобы перевернуть
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FlashcardModal;
