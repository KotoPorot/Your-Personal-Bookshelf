import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useReader } from "../context/ReaderContext";
import { useTranslate } from "../hooks/translator/useTranslate";
import { useFlashcard } from "../context/FlashcardContext"; // 👈 1. Импортируем наш контекст
import "./styles/SelectionMenu.css";

const SelectionMenu = () => {
	const { state, actions } = useReader();
	const {
		visible,
		top,
		left,
		text: selectedText,
		contextText,
	} = state.selectionMenu;

	// 👈 2. Берём метод открытия из FlashcardContext
	const { openModalWithSelection } = useFlashcard();

	const [viewMode, setViewMode] = useState("menu");
	const menuRef = useRef(null);
	const [placement, setPlacement] = useState("top");

	const {
		translatedText,
		isLoading,
		error,
		translate,
		reset: resetTranslation,
	} = useTranslate();

	useLayoutEffect(() => {
		if (visible && menuRef.current) {
			const menuHeight = menuRef.current.offsetHeight || 150;
			const spaceAbove = top;

			if (spaceAbove < menuHeight + 20) {
				setPlacement("bottom");
			} else {
				setPlacement("top");
			}
		}
	}, [visible, top, viewMode, translatedText, isLoading]);

	useEffect(() => {
		if (!visible) {
			setViewMode("menu");
			resetTranslation();
		}
	}, [visible, resetTranslation]);

	if (!visible) return null;

	const handleTranslateClick = () => {
		setViewMode("translation");
		translate(selectedText);
	};

	// 👈 3. Создаём обработчик для карточки
	const handleCreateFlashcardClick = () => {
		// Передаем выбранный текст в FlashcardContext
		openModalWithSelection(selectedText, contextText);

		console.log(
			`[SelectionMenu] Создание карточки для выделенного текста: "${selectedText}" с контекстом: "${contextText}"`,
		);

		// Сбрасываем меню выделения в ReaderContext
		actions.closeSelectionMenu();
		actions.clearBrowserSelection();
	};

	const handleClose = () => {
		actions.closeSelectionMenu();
	};

	const menuClasses = [
		"selection-floating-menu",
		`placement-${placement}`,
		`mode-${viewMode}`,
	].join(" ");

	return (
		<div
			ref={menuRef}
			className={menuClasses}
			onClick={(e) => e.stopPropagation()}
			style={{ top: `${top}px`, left: `${left}px` }}
		>
			{/* РЕЖИМ 1: ОБЫЧНЫЕ КНОПКИ МЕНЮ */}
			{viewMode === "menu" && (
				<div className="selection-menu-actions">
					<button className="selection-btn" onClick={actions.openNoteModal}>
						📝 Заметка
					</button>
					<span className="selection-menu-divider">|</span>
					<button className="selection-btn" onClick={handleTranslateClick}>
						🌐 Перевести
					</button>
					<button
						className="selection-btn"
						onClick={
							handleCreateFlashcardClick
						} /* 👈 4. Вызываем новый обработчик */
					>
						📘 Создать карточку
					</button>
				</div>
			)}

			{/* РЕЖИМ 2: ОТОБРАЖЕНИЕ ПЕРЕВОДА */}
			{viewMode === "translation" && (
				<div className="selection-translation-content">
					<div className="selection-translation-header">
						<button
							className="selection-btn selection-btn-back"
							onClick={() => setViewMode("menu")}
						>
							◀ Назад
						</button>

						<button
							className="selection-btn selection-btn-close"
							onClick={handleClose}
							title="Закрыть"
						>
							✕
						</button>
					</div>

					{isLoading && (
						<div className="selection-translation-loading">⏳ Переводим...</div>
					)}

					{error && (
						<div className="selection-translation-error">⚠️ {error}</div>
					)}

					{!isLoading && !error && translatedText && (
						<div className="selection-translation-result">{translatedText}</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SelectionMenu;
