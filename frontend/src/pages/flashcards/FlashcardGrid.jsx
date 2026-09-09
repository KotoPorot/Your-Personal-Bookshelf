import { useState } from "react";
import FlashcardCard from "./FlashcardCard";
import ExportModal from "./ExportModal";
import { useFlashcards } from "../../context/FlashcardContext";
import "./ExportToolbar.css";

const FlashcardGrid = ({ cards, activeFolderId, onCardClick }) => {
	const { exportCards } = useFlashcards();
	const [isSelectionMode, setIsSelectionMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);

	// Состояния для модального окна экспорта
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);
	const [exportedText, setExportedText] = useState("");
	const [isExporting, setIsExporting] = useState(false);

	const filteredCards = cards.filter(
		(card) => Number(card.folderId) === Number(activeFolderId),
	);

	const handleToggleSelectionMode = () => {
		setIsSelectionMode((prev) => !prev);
		setSelectedIds([]);
	};

	const handleSelectAll = () => {
		if (selectedIds.length === filteredCards.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(filteredCards.map((c) => c.id));
		}
	};

	const handleToggleCard = (cardId) => {
		setSelectedIds((prev) =>
			prev.includes(cardId)
				? prev.filter((id) => id !== cardId)
				: [...prev, cardId],
		);
	};

	const handleCardClick = (card) => {
		if (isSelectionMode) {
			handleToggleCard(card.id);
		} else if (onCardClick) {
			onCardClick(card);
		}
	};

	// Вызов экспорта с созданием текста через контекст
	const handleExport = async () => {
		setIsExportModalOpen(true);
		setIsExporting(true);
		try {
			const resultText = await exportCards(selectedIds);
			setExportedText(resultText);
		} catch (err) {
			console.error("Ошибка при экспорте:", err);
			setExportedText("Произошла ошибка при загрузке экспорта.");
		} finally {
			setIsExporting(false);
		}
	};

	const isAllSelected =
		filteredCards.length > 0 && selectedIds.length === filteredCards.length;

	return (
		<div className="flashcards-grid-container">
			{/* Тулбар экспорта */}
			<div className="export-toolbar">
				{!isSelectionMode ? (
					<button
						className="btn-export-start"
						onClick={handleToggleSelectionMode}
						disabled={filteredCards.length === 0}
					>
						📦 Выбрать карточки для экспорта
					</button>
				) : (
					<>
						<div className="export-toolbar-left">
							<label className="select-all-label">
								<input
									type="checkbox"
									checked={isAllSelected}
									onChange={handleSelectAll}
								/>
								Выбрать все
							</label>
							<span className="selected-count">
								Выбрано: {selectedIds.length} из {filteredCards.length}
							</span>
						</div>

						<div className="export-toolbar-right">
							<button
								className="btn-cancel-export"
								onClick={handleToggleSelectionMode}
							>
								Отмена
							</button>
							<button
								className="btn-export-action"
								disabled={selectedIds.length === 0}
								onClick={handleExport}
							>
								📤 Экспортировать ({selectedIds.length})
							</button>
						</div>
					</>
				)}
			</div>

			{/* Сетка карточек */}
			<div className="book-grid">
				{filteredCards.length > 0 ? (
					filteredCards.map((card) => {
						const isSelected = selectedIds.includes(card.id);

						return (
							<div
								key={card.id}
								className={`selectable-card-wrapper ${
									isSelectionMode && isSelected ? "selected" : ""
								}`}
								onClick={() => handleCardClick(card)}
							>
								{isSelectionMode && (
									<input
										type="checkbox"
										className="card-checkbox"
										checked={isSelected}
										onChange={() => handleToggleCard(card.id)}
										onClick={(e) => e.stopPropagation()}
									/>
								)}
								<FlashcardCard
									card={card}
									onClick={isSelectionMode ? undefined : onCardClick}
								/>
							</div>
						);
					})
				) : (
					<p className="empty-shelf-message">В этой папке пока нет карточек</p>
				)}
			</div>

			{/* Модальное окно результатов экспорта */}
			<ExportModal
				isOpen={isExportModalOpen}
				onClose={() => setIsExportModalOpen(false)}
				text={exportedText}
				isLoading={isExporting}
			/>
		</div>
	);
};

export default FlashcardGrid;
