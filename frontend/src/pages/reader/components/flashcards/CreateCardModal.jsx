// src/pages/reader/components/flashcard/CreateCardModal.jsx
import React from "react";
import { useFlashcard } from "../../context/FlashcardContext";
import { useCreateCard } from "../../hooks/flashcards/useCreateCard";
import { useTranslationSettings } from "../../../../context/TranslationContext";
import "./CreateCardModal.css";

const CreateCardModal = () => {
  const { isCreateCardOpen, closeCreateCardModal, createCardData } =
    useFlashcard();
  const { targetLanguage } = useTranslationSettings();

  const {
    phraseText,
    phraseTranslation,
    definition,
    setDefinition,
    loadingDef,
    defRegenerating,
    examples,
    loadingExamples,
    exampleLoadingIds,
    handleRegenerateDefinition,
    handleRegenerateExample,
    handleDeleteExample,
    updateExampleField,
    handleSaveCard,
  } = useCreateCard(isCreateCardOpen ? createCardData : null, targetLanguage);

  if (!isCreateCardOpen) return null;

  const onSave = () => {
    handleSaveCard();
    closeCreateCardModal();
  };

  return (
    <div className="card-modal-overlay" onClick={closeCreateCardModal}>
      <div
        className="card-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Хедер модалки */}
        <div className="card-modal-header">
          <h3>Создание карточки</h3>
          <button className="card-close-btn" onClick={closeCreateCardModal}>
            ✕
          </button>
        </div>

        {/* Тело модалки */}
        <div className="card-modal-body">
          {/* ВЕРХНЯЯ СЕКЦИЯ: Лицевая (Определение) vs Обратная (Фраза) */}
          <div className="card-top-grid">
            {/* Слева: Лицевая сторона */}
            <div className="card-top-col">
              <div className="card-side-badge badge-front">ЛИЦЕВАЯ СТОРОНА</div>
              <div className="card-section">
                <div className="card-section-header">
                  <label className="card-label">Определение:</label>
                  <button
                    type="button"
                    className="card-icon-btn"
                    onClick={handleRegenerateDefinition}
                    disabled={defRegenerating || loadingDef}
                    title="Перегенерировать определение"
                  >
                    {defRegenerating ? "⏳" : "🔄"}
                  </button>
                </div>
                {loadingDef ? (
                  <div className="card-skeleton">Генерация определения...</div>
                ) : (
                  <textarea
                    className="card-textarea card-def-textarea"
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="Введите или сгенерируйте определение..."
                    rows={3}
                  />
                )}
              </div>
            </div>

            {/* Справа: Обратная сторона */}
            <div className="card-top-col">
              <div className="card-side-badge badge-back">ОБРАТНАЯ СТОРОНА</div>
              <div className="card-phrase-header">
                <div className="card-phrase-title">{phraseText}</div>
                <div className="card-phrase-subtranslation">
                  {phraseTranslation}
                </div>
              </div>
            </div>
          </div>

          {/* ЗАГОЛОВКИ СПИСКА ПРИМЕРОВ */}
          <div className="card-examples-header-grid">
            <label className="card-label">Примеры (с пропусками):</label>
            <label className="card-label">Полные предложения и перевод:</label>
          </div>

          {/* СПИСОК ПРИМЕРОВ ПАРАМИ (ВЫРОВНЕНЫ СТРОКА В СТРОКУ) */}
          <div className="card-examples-list-wrapper">
            {loadingExamples ? (
              <div className="card-skeleton">Загрузка примеров...</div>
            ) : (
              examples.map((ex, index) => (
                <div key={ex.id} className="card-example-pair-row">
                  {/* Левая часть карточки примера (с пропуском) */}
                  <div className="card-example-item front-item">
                    <div className="card-example-controls">
                      <span className="card-ex-num">#{index + 1}</span>
                      <div className="card-controls-right">
                        <button
                          type="button"
                          className="card-icon-btn"
                          onClick={() => handleRegenerateExample(ex.id)}
                          disabled={exampleLoadingIds[ex.id]}
                          title="Перегенерировать пример"
                        >
                          {exampleLoadingIds[ex.id] ? "⏳" : "🔄"}
                        </button>
                        <button
                          type="button"
                          className="card-icon-btn delete-btn"
                          onClick={() => handleDeleteExample(ex.id)}
                          title="Удалить пример"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    {/* Текстовое поле с автопереносом */}
                    <textarea
                      className="card-textarea auto-height-textarea"
                      value={ex.clozeSentence}
                      onChange={(e) =>
                        updateExampleField(
                          ex.id,
                          "clozeSentence",
                          e.target.value,
                        )
                      }
                      rows={2}
                    />
                  </div>

                  {/* Правая часть карточки примера (полное предложение + перевод) */}
                  <div className="card-example-item back-item">
                    <div className="card-example-controls">
                      <span className="card-ex-num">#{index + 1}</span>
                    </div>
                    <div className="card-back-inputs">
                      {/* Полное предложение */}
                      <textarea
                        className="card-textarea auto-height-textarea"
                        value={ex.sentence}
                        onChange={(e) =>
                          updateExampleField(ex.id, "sentence", e.target.value)
                        }
                        rows={2}
                      />
                      {/* Перевод */}
                      <textarea
                        className="card-textarea auto-height-textarea translation-textarea"
                        value={ex.translation}
                        onChange={(e) =>
                          updateExampleField(
                            ex.id,
                            "translation",
                            e.target.value,
                          )
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Футер */}
        <div className="card-modal-footer">
          <button className="card-btn-secondary" onClick={closeCreateCardModal}>
            Отмена
          </button>
          <button className="card-btn-primary" onClick={onSave}>
            Сохранить карточку
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCardModal;
