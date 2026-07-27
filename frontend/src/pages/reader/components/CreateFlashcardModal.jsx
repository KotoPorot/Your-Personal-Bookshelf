import React, { useState, useEffect } from "react";
import { useFlashcard } from "../context/FlashcardContext";
import "./styles/CreateFlashcardModal.css";

// ----------------------------------------------------------------------
// MOCK DATA (Имитация ответа от ИИ)
// ----------------------------------------------------------------------
const MOCK_AI_PHRASES = [
  { id: "1", text: "weep for the future", translation: "оплакивать будущее" },
  { id: "2", text: "Butlerian insanity", translation: "батлерианское безумие" },
  { id: "3", text: "relegated to huddling", translation: "обречены ютиться" },
];

const MOCK_AI_EXAMPLES = [
  {
    id: "e1",
    front: "Many historians weep for the future after seeing the news.",
    back: "Многие историки оплакивают будущее, посмотрев новости.",
  },
  {
    id: "e2",
    front: "We shouldn't weep for the future, but work on the present.",
    back: "Нам следует не оплакивать будущее, а работать над настоящим.",
  },
  {
    id: "e3",
    front: "Old men often weep for the future of new generations.",
    back: "Старики часто оплакивают будущее новых поколений.",
  },
  {
    id: "e4",
    front: "Why do you weep for the future when everything is fine?",
    back: "Почему ты оплакиваешь будущее, когда всё в порядке?",
  },
  {
    id: "e5",
    front: "Don't weep for the future before it even happens.",
    back: "Не оплакивай будущее до того, как оно наступило.",
  },
];

const CreateFlashcardModal = () => {
  // Исправлено подключение контекста
  const { isOpen, closeModal, selectedText } = useFlashcard();

  // Локальные состояния процесса
  const [step, setStep] = useState(1); // 1: Выбор фраз, 2: Выбор примеров
  const [loading, setLoading] = useState(false);

  // Данные Шага 1
  const [aiPhrases, setAiPhrases] = useState([]);
  const [selectedPhraseIds, setSelectedPhraseIds] = useState([]);
  const [customPhraseText, setCustomPhraseText] = useState("");

  // Данные Шага 2
  const [examplesList, setExamplesList] = useState([]);
  const [selectedExampleIds, setSelectedExampleIds] = useState([]);

  // Загрузка / Симуляция первого запроса к бэкенду
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLoading(true);

      // Симуляция запроса к ИИ (Шаг 1)
      setTimeout(() => {
        setAiPhrases(MOCK_AI_PHRASES);
        setSelectedPhraseIds(["1"]); // По умолчанию выберем первую фразу
        setCustomPhraseText(MOCK_AI_PHRASES[0].text);
        setLoading(false);
      }, 600);
    }
  }, [isOpen, selectedText]);

  if (!isOpen) return null;

  // --- ХЕНДЛЕРЫ ШАГА 1 ---
  const handleTogglePhrase = (phrase) => {
    let updatedIds = [];
    if (selectedPhraseIds.includes(phrase.id)) {
      updatedIds = selectedPhraseIds.filter((id) => id !== phrase.id);
    } else {
      updatedIds = [...selectedPhraseIds, phrase.id];
    }
    setSelectedPhraseIds(updatedIds);

    // Собираем текст выбранных фраз в поле редактирования
    const combinedText = aiPhrases
      .filter((p) => updatedIds.includes(p.id))
      .map((p) => p.text)
      .join("; ");
    setCustomPhraseText(combinedText);
  };

  const handleGoToExamples = () => {
    setLoading(true);
    // Симуляция запроса к бэкенду за примерами (Шаг 2)
    setTimeout(() => {
      setExamplesList(MOCK_AI_EXAMPLES);
      setSelectedExampleIds([MOCK_AI_EXAMPLES[0].id]); // По умолчанию выбираем 1 пример
      setStep(2);
      setLoading(false);
    }, 600);
  };

  // --- ХЕНДЛЕРЫ ШАГА 2 ---
  const handleToggleExample = (id) => {
    if (selectedExampleIds.includes(id)) {
      setSelectedExampleIds(selectedExampleIds.filter((item) => item !== id));
    } else {
      if (selectedExampleIds.length >= 3) {
        alert("Можно выбрать не более 3 примеров!");
        return;
      }
      setSelectedExampleIds([...selectedExampleIds, id]);
    }
  };

  const handleRegenerateExample = (exampleId) => {
    // Симуляция перезапроса одного примера
    setExamplesList((prev) =>
      prev.map((ex) =>
        ex.id === exampleId
          ? {
              ...ex,
              front: `[Сгенерирован новый пример для ${ex.id}]`,
              back: `[Перевод нового примера]`,
            }
          : ex,
      ),
    );
  };

  const handleSaveCard = () => {
    const finalCardData = {
      targetPhrases: customPhraseText,
      examples: examplesList.filter((e) => selectedExampleIds.includes(e.id)),
    };

    console.log("Сохранение карточки:", finalCardData);
    alert("Карточка успешно сохранена!");
    closeModal();
  };

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
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "30px 0", color: "#aaa" }}
            >
              ⏳ ИИ анализирует текст...
            </div>
          ) : step === 1 ? (
            /* ================= ШАГ 1 ================= */
            <>
              <div>
                <span className="flashcard-section-label">
                  Найденные фразы (выберите нужное):
                </span>
                <div className="flashcard-phrase-list">
                  {aiPhrases.map((phrase) => {
                    const isSelected = selectedPhraseIds.includes(phrase.id);
                    return (
                      <div
                        key={phrase.id}
                        className={`flashcard-phrase-item ${isSelected ? "selected" : ""}`}
                        onClick={() => handleTogglePhrase(phrase)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // Обрабатывается в родительском div
                        />
                        <div>
                          <div className="flashcard-phrase-text">
                            {phrase.text}
                          </div>
                          <div className="flashcard-phrase-translation">
                            {phrase.translation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="flashcard-section-label">
                  Фраза на карточке (можно изменить):
                </span>
                <input
                  type="text"
                  className="flashcard-input-field"
                  value={customPhraseText}
                  onChange={(e) => setCustomPhraseText(e.target.value)}
                  placeholder="Введите слово или фразу..."
                />
              </div>
            </>
          ) : (
            /* ================= ШАГ 2 ================= */
            <>
              <div>
                <span className="flashcard-section-label">
                  Примеры использования (выберите от 1 до 3):
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {examplesList.map((example) => {
                    const isSelected = selectedExampleIds.includes(example.id);
                    return (
                      <div
                        key={example.id}
                        className={`flashcard-example-item ${isSelected ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleExample(example.id)}
                        />
                        <div
                          className="flashcard-example-content"
                          style={{ flex: 1, cursor: "pointer" }}
                          onClick={() => handleToggleExample(example.id)}
                        >
                          <div className="flashcard-example-front">
                            {example.front}
                          </div>
                          <div className="flashcard-example-back">
                            {example.back}
                          </div>
                        </div>
                        <button
                          className="flashcard-refresh-btn"
                          onClick={() => handleRegenerateExample(example.id)}
                          title="Сгенерировать новый пример"
                        >
                          🔄
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
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
              onClick={handleGoToExamples}
              disabled={!customPhraseText.trim() || loading}
            >
              Далее (Примеры) ▶
            </button>
          ) : (
            <button
              className="flashcard-btn-primary"
              onClick={handleSaveCard}
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
