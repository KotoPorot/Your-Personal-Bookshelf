// src/pages/reader/context/FlashcardContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

// MOCK DATA
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

const FlashcardContext = createContext(null);

export const FlashcardProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Шаг 1: Фразы
  const [aiPhrases, setAiPhrases] = useState([]);
  const [selectedPhraseIds, setSelectedPhraseIds] = useState([]);
  const [customPhraseText, setCustomPhraseText] = useState("");

  // Шаг 2: Примеры
  const [examplesList, setExamplesList] = useState([]);
  const [selectedExampleIds, setSelectedExampleIds] = useState([]);

  // Открытие модалки из читалки (передаем выделенный текст)
  const openModalWithSelection = useCallback((selectedText) => {
    setIsOpen(true);
    setStep(1);
    setLoading(true);

    // TODO: Заменится на реальный API запрос к бэку
    setTimeout(() => {
      setAiPhrases(MOCK_AI_PHRASES);
      setSelectedPhraseIds(["1"]);
      setCustomPhraseText(MOCK_AI_PHRASES[0].text);
      setLoading(false);
    }, 600);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setStep(1);
    setCustomPhraseText("");
    setSelectedPhraseIds([]);
    setSelectedExampleIds([]);
  }, []);

  // Переключение выбора фразы на шаге 1
  const togglePhrase = useCallback(
    (phrase) => {
      setSelectedPhraseIds((prev) => {
        const updated = prev.includes(phrase.id)
          ? prev.filter((id) => id !== phrase.id)
          : [...prev, phrase.id];

        // Автоматически обновляем текстовое поле
        const combined = aiPhrases
          .filter((p) => updated.includes(p.id))
          .map((p) => p.text)
          .join("; ");
        setCustomPhraseText(combined);

        return updated;
      });
    },
    [aiPhrases],
  );

  // Запросить примеры (Переход на Шаг 2)
  const fetchExamples = useCallback(() => {
    setLoading(true);
    // TODO: Заменится на реальный API запрос за примерами
    setTimeout(() => {
      setExamplesList(MOCK_AI_EXAMPLES);
      setSelectedExampleIds([MOCK_AI_EXAMPLES[0].id]);
      setStep(2);
      setLoading(false);
    }, 600);
  }, []);

  // Переключение выбора примера на шаге 2
  const toggleExample = useCallback((id) => {
    setSelectedExampleIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        alert("Можно выбрать не более 3 примеров!");
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  // Перегенерация одного примера
  const regenerateExample = useCallback((exampleId) => {
    // TODO: Заменится на реальный API запрос для одного примера
    setExamplesList((prev) =>
      prev.map((ex) =>
        ex.id === exampleId
          ? {
              ...ex,
              front: `[Новый пример ${ex.id}]`,
              back: `[Перевод примера]`,
            }
          : ex,
      ),
    );
  }, []);

  // Финальное сохранение
  const saveCard = useCallback(async () => {
    const payload = {
      targetPhrases: customPhraseText,
      examples: examplesList.filter((e) => selectedExampleIds.includes(e.id)),
    };
    console.log("Сохранение на бэкенд:", payload);
    // TODO: Запрос сохранения
    alert("Карточка сохранена!");
    closeModal();
  }, [customPhraseText, examplesList, selectedExampleIds, closeModal]);

  return (
    <FlashcardContext.Provider
      value={{
        isOpen,
        step,
        loading,
        aiPhrases,
        selectedPhraseIds,
        customPhraseText,
        examplesList,
        selectedExampleIds,
        setStep,
        setCustomPhraseText,
        openModalWithSelection,
        closeModal,
        togglePhrase,
        fetchExamples,
        toggleExample,
        regenerateExample,
        saveCard,
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
