import React, { useState } from "react";
import { useFlashcards } from "../../context/FlashcardContext";
import "./EditFlashcardForm.css";

const EditFlashcardForm = ({ card, folders, onCancel, onSuccess }) => {
  const { updateCard } = useFlashcards();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: card.id,
    folderId: card.folderId || card.folder?.id || (folders[0]?.id ?? ""),
    phrase: card.phrase || "",
    phraseTranslation: card.phraseTranslation || "",
    targetLang: card.targetLang || "",
    definition: card.definition || "",
    examples: card.examples
      ? card.examples.map((ex) => ({
          id: ex.id || null,
          example: ex.example || ex.sentence || "",
          translation: ex.translation || "",
          withoutTargetWord: ex.withoutTargetWord || ex.clozeSentence || "",
        }))
      : [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExampleChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedExamples = [...prev.examples];
      updatedExamples[index] = { ...updatedExamples[index], [field]: value };
      return { ...prev, examples: updatedExamples };
    });
  };

  const handleAddExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        { id: null, example: "", translation: "", withoutTargetWord: "" },
      ],
    }));
  };

  const handleRemoveExample = (index) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      id: Number(formData.id),
      folderId: Number(formData.folderId),
      phrase: formData.phrase,
      phraseTranslation: formData.phraseTranslation,
      targetLang: formData.targetLang,
      definition: formData.definition,
      examples: formData.examples.map((ex) => ({
        id: ex.id ? Number(ex.id) : null,
        example: ex.example,
        translation: ex.translation,
        withoutTargetWord: ex.withoutTargetWord,
      })),
    };

    try {
      await updateCard(payload);
      onSuccess();
    } catch (err) {
      console.error("Ошибка сохранения карточки:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="edit-flashcard-form" onSubmit={handleSubmit}>
      <div className="edit-form-header">
        <h3>✏️ Редактирование карточки</h3>
        <button type="button" className="back-link-btn" onClick={onCancel}>
          ← Назад к просмотру
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Папка</label>
        <select
          name="folderId"
          className="form-select"
          value={formData.folderId}
          onChange={handleChange}
          required
        >
          {folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Определение (definition)</label>
        <textarea
          name="definition"
          className="form-textarea"
          value={formData.definition}
          onChange={handleChange}
          required
          rows={2}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Фраза / Слово (phrase)</label>
          <input
            type="text"
            name="phrase"
            className="form-input"
            value={formData.phrase}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">
            Перевод фразы (phraseTranslation)
          </label>
          <input
            type="text"
            name="phraseTranslation"
            className="form-input"
            value={formData.phraseTranslation}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Язык (targetLang)</label>
        <input
          type="text"
          name="targetLang"
          className="form-input"
          value={formData.targetLang}
          onChange={handleChange}
        />
      </div>

      <div className="examples-section">
        <div className="examples-header">
          <span className="form-label">Примеры использования (examples)</span>
          <button
            type="button"
            className="btn-add-example"
            onClick={handleAddExample}
          >
            + Добавить пример
          </button>
        </div>

        {formData.examples.map((ex, idx) => (
          <div key={idx} className="example-card">
            <button
              type="button"
              className="btn-remove-example"
              onClick={() => handleRemoveExample(idx)}
              title="Удалить пример"
            >
              ✖
            </button>

            <input
              type="text"
              className="form-input"
              placeholder="Пропуск целевого слова (withoutTargetWord)"
              value={ex.withoutTargetWord}
              onChange={(e) =>
                handleExampleChange(idx, "withoutTargetWord", e.target.value)
              }
            />
            <input
              type="text"
              className="form-input"
              placeholder="Полное предложение (example)"
              value={ex.example}
              onChange={(e) =>
                handleExampleChange(idx, "example", e.target.value)
              }
            />
            <input
              type="text"
              className="form-input"
              placeholder="Перевод предложения (translation)"
              value={ex.translation}
              onChange={(e) =>
                handleExampleChange(idx, "translation", e.target.value)
              }
            />
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </form>
  );
};

export default EditFlashcardForm;
