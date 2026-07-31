// src/pages/reader/context/FlashcardContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const FlashcardContext = createContext(null);

export const FlashcardProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    selectedText: "",
    contextText: "",
  });

  const openModalWithSelection = useCallback((selectedText, contextText) => {
    setModalState({ isOpen: true, selectedText, contextText });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, selectedText: "", contextText: "" });
  }, []);

  return (
    <FlashcardContext.Provider
      value={{
        isOpen: modalState.isOpen,
        selectedText: modalState.selectedText,
        contextText: modalState.contextText,
        openModalWithSelection,
        closeModal,
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
