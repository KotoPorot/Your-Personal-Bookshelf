// src/pages/reader/components/CreateFlashcardModal.jsx
import React from "react";
import { useFlashcard } from "../../context/FlashcardContext";
import { useFlashcardBuilder } from "../../hooks/flashcards/useFlashcardBuilder";
import StepPhrases from "./StepPhrases";
import StepExamples from "./StepExamples";
import "./CreateFlashcardModal.css";

const CreateFlashcardModal = () => {
  const { isOpen, closeModal, selectedText } = useFlashcard();

  const {
    step,
    setStep,
    loading,
    error,
    phrases,
    selectedPhraseIds,
    customPhraseText,
    setCustomPhraseText,
    examples,
    selectedExampleIds,
    togglePhrase,
    goToExamples,
    toggleExample,
    saveCard,
  } = useFlashcardBuilder(isOpen ? selectedText : null, closeModal);

  if (!isOpen) return null;

  return (
    <div className="flashcard-modal-overlay" onClick={closeModal}>
      <div
        className="flashcard-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ХЕДЕР */}
        <div className="flashcard-modal-header">
          <h3>
            {step === 1 ? "Шаг 1: Выбор фраз" : "Шаг 2: Примеры к карточке"}
          </h3>
          <button className="flashcard-close-btn" onClick={closeModal}>
            ✕
          </button>
        </div>

        {/* ТЕЛО МОДАЛКИ */}
        <div className="flashcard-modal-body">
          {error && <div className="flashcard-error-banner">{error}</div>}

          {loading ? (
            <div className="flashcard-loading">⏳ ИИ анализирует текст...</div>
          ) : step === 1 ? (
            <StepPhrases
              phrases={phrases}
              selectedPhraseIds={selectedPhraseIds}
              customPhraseText={customPhraseText}
              onTogglePhrase={togglePhrase}
              onCustomTextChange={setCustomPhraseText}
            />
          ) : (
            <StepExamples
              examples={examples}
              selectedExampleIds={selectedExampleIds}
              onToggleExample={toggleExample}
            />
          )}
        </div>

        {/* ФУТЕР */}
        <div className="flashcard-modal-footer">
          {step === 2 ? (
            <button
              className="flashcard-btn-secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              ◀ Назад
            </button>
          ) : (
            <button className="flashcard-btn-secondary" onClick={closeModal}>
              Отмена
            </button>
          )}

          {step === 1 ? (
            <button
              className="flashcard-btn-primary"
              onClick={goToExamples}
              disabled={!customPhraseText.trim() || loading}
            >
              Далее (Примеры) ▶
            </button>
          ) : (
            <button
              className="flashcard-btn-primary"
              onClick={saveCard}
              disabled={selectedExampleIds.length === 0 || loading}
            >
              Сохранить карточку
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateFlashcardModal;
