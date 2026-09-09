// src/pages/reader/context/FlashcardContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const FlashcardContext = createContext(null);

export const FlashcardProvider = ({ children }) => {
	// 1. Состояние модалки анализа текста (GetPhrasesModal)
	const [phrasesModalState, setPhrasesModalState] = useState({
		isOpen: false,
		selectedText: "",
		contextText: "",
	});

	// 2. Состояние модалки создания карточки (CreateCardModal)
	const [createCardModalState, setCreateCardModalState] = useState({
		isOpen: false,
		cardData: null, // Сюда передаем выбранную фразу { sourceText, translation }
	});

	// --- Методы для GetPhrasesModal ---
	const openModalWithSelection = useCallback(
		(selectedText, contextText = "") => {
			setPhrasesModalState({
				isOpen: true,
				selectedText,
				contextText: contextText || selectedText,
			});
		},
		[],
	);

	const closeModal = useCallback(() => {
		setPhrasesModalState({
			isOpen: false,
			selectedText: "",
			contextText: "",
		});
	}, []);

	// --- Методы для CreateCardModal ---
	const openCreateCardModal = useCallback((cardData) => {
		setCreateCardModalState({
			isOpen: true,
			cardData,
		});
	}, []);

	const closeCreateCardModal = useCallback(() => {
		setCreateCardModalState({
			isOpen: false,
			cardData: null,
		});
	}, []);

	return (
		<FlashcardContext.Provider
			value={{
				// Поля для GetPhrasesModal
				isOpen: phrasesModalState.isOpen,
				selectedText: phrasesModalState.selectedText,
				contextText: phrasesModalState.contextText,
				openModalWithSelection,
				closeModal,

				// Поля для CreateCardModal
				isCreateCardOpen: createCardModalState.isOpen,
				createCardData: createCardModalState.cardData,
				openCreateCardModal,
				closeCreateCardModal,
			}}
		>
			{children}
		</FlashcardContext.Provider>
	);
};

export const useFlashcard = () => {
	const context = useContext(FlashcardContext);
	if (!context) {
		throw new Error("useFlashcard must be used within a FlashcardProvider");
	}
	return context;
};
