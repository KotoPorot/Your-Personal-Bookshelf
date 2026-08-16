import React, { useState, useEffect } from "react";
import { useFlashcard } from "../../context/FlashcardContext";
import { useFlashcards } from "../../../../context/FlashcardContext";
import { useCreateCard } from "../../hooks/flashcards/useCreateCard";
import { useTranslationSettings } from "../../../../context/TranslationContext";
import { useFolder } from "../../../../context/FolderContext"; // <--- Подключаем FolderContext
import "./CreateCardModal.css";

const CreateCardModal = () => {
  const { isCreateCardOpen, closeCreateCardModal, createCardData } =
    useFlashcard();
  const { targetLanguage } = useTranslationSettings();

  // Достаем папки и метод создания из контекста папок
  const { folders, createFolder, activeFolderId } = useFolder();

  const { createCard } = useFlashcards();

  // Локальное состояние для выбранной папки
  const [selectedFolderId, setSelectedFolderId] = useState("");

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

  // При открытии модалки устанавливаем дефолтную папку (активную или первую из списка)
  useEffect(() => {
    if (isCreateCardOpen) {
      if (activeFolderId) {
        setSelectedFolderId(activeFolderId);
      } else if (folders.length > 0) {
        setSelectedFolderId(folders[0].id);
      } else {
        setSelectedFolderId("");
      }
    }
  }, [isCreateCardOpen, activeFolderId, folders]);

  if (!isCreateCardOpen) return null;

  // Обработчик быстрого создания папки прямо из модалки
  const handleAddFolder = async () => {
    const name = prompt("Введите название новой папки:");
    if (name && name.trim()) {
      try {
        const newFolder = await createFolder(name.trim());
        if (newFolder && newFolder.id) {
          setSelectedFolderId(newFolder.id); // Автоматически выбираем созданную папку
        }
      } catch (err) {
        alert("Ошибка при создании папки: " + err.message);
      }
    }
  };

  const onSave = async () => {
    if (!selectedFolderId) {
      alert("Пожалуйста, выберите папку для сохранения карточки!");
      return;
    }

    // 1. Собираем данные карточки в payload
    const payload = handleSaveCard(Number(selectedFolderId));

    try {
      // 2. 👈 ЗДЕСЬ ИСПОЛЬЗУЕТСЯ createCard: отправляем POST-запрос на бэкенд
      await createCard(payload);

      // 3. Закрываем модалку после успешного сохранения
      closeCreateCardModal();
    } catch (err) {
      alert("Ошибка при сохранении карточки: " + err.message);
    }
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
          {/* СЕКЦИЯ ВЫБОРА ПАПКИ */}
          <div className="card-folder-select-section">
            <label className="card-label">
              Папка <span style={{ color: "red" }}>*</span>:
            </label>
            <div className="card-folder-controls">
              <select
                className="card-select"
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
              >
                <option value="" disabled>
                  -- Выберите папку --
                </option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="card-btn-add-folder"
                onClick={handleAddFolder}
                title="Создать новую папку"
              >
                ➕ Новая папка
              </button>
            </div>
          </div>

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

          {/* СПИСОК ПРИМЕРОВ ПАРАМИ */}
          <div className="card-examples-list-wrapper">
            {loadingExamples ? (
              <div className="card-skeleton">Загрузка примеров...</div>
            ) : (
              examples.map((ex, index) => (
                <div key={ex.id} className="card-example-pair-row">
                  {/* Левая часть */}
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

                  {/* Правая часть */}
                  <div className="card-example-item back-item">
                    <div className="card-example-controls">
                      <span className="card-ex-num">#{index + 1}</span>
                    </div>
                    <div className="card-back-inputs">
                      <textarea
                        className="card-textarea auto-height-textarea"
                        value={ex.sentence}
                        onChange={(e) =>
                          updateExampleField(ex.id, "sentence", e.target.value)
                        }
                        rows={2}
                      />
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
          <button
            className="card-btn-primary"
            onClick={onSave}
            disabled={!selectedFolderId}
            title={!selectedFolderId ? "Сначала выберите папку" : ""}
          >
            Сохранить карточку
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCardModal;
