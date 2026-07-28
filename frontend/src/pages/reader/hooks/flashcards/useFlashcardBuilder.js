// src/pages/reader/hooks/useFlashcardBuilder.js
import { useState, useEffect, useCallback } from "react";

// Mock Data (в будущем заменится на вызовы API-сервиса)
const MOCK_AI_PHRASES = [
  { id: "1", text: "weep for the future", translation: "оплакивать будущее" },
  { id: "2", text: "Butlerian insanity", translation: "батлерианское безумие" },
  { id: "3", text: "relegated to huddling", translation: "обречены ютиться" },
];

const MOCK_AI_EXAMPLES = [
  {
    id: "e1",
    front: "Many historians weep for the future after seeing the news.",
    back: "Многие историки оплакивают будущее...",
  },
  {
    id: "e2",
    front: "We shouldn't weep for the future, but work on the present.",
    back: "Нам следует не оплакивать будущее...",
  },
];

export const useFlashcardBuilder = (selectedText, onSaveSuccess) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Шаг 1: Фразы
  const [phrases, setPhrases] = useState([]);
  const [selectedPhraseIds, setSelectedPhraseIds] = useState([]);
  const [customPhraseText, setCustomPhraseText] = useState("");

  // Шаг 2: Примеры
  const [examples, setExamples] = useState([]);
  const [selectedExampleIds, setSelectedExampleIds] = useState([]);

  // Загрузка фраз при открытии
  useEffect(() => {
    if (!selectedText) return;

    let isMounted = true;
    setLoading(true);
    setStep(1);

    // Имитация API запроса
    setTimeout(() => {
      if (!isMounted) return;
      setPhrases(MOCK_AI_PHRASES);
      setSelectedPhraseIds(["1"]);
      setCustomPhraseText(MOCK_AI_PHRASES[0]?.text || selectedText);
      setLoading(false);
    }, 500);

    return () => {
      isMounted = false;
    };
  }, [selectedText]);

  // Выбор фраз на Шаге 1
  const togglePhrase = useCallback(
    (phrase) => {
      setSelectedPhraseIds((prev) => {
        const next = prev.includes(phrase.id)
          ? prev.filter((id) => id !== phrase.id)
          : [...prev, phrase.id];

        const combined = phrases
          .filter((p) => next.includes(p.id))
          .map((p) => p.text)
          .join("; ");

        setCustomPhraseText(combined);
        return next;
      });
    },
    [phrases],
  );

  // Переход к Шагу 2
  const goToExamples = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Имитация API запроса за примерами
    setTimeout(() => {
      setExamples(MOCK_AI_EXAMPLES);
      setSelectedExampleIds([MOCK_AI_EXAMPLES[0]?.id]);
      setStep(2);
      setLoading(false);
    }, 500);
  }, []);

  // Выбор примеров на Шаге 2 (максимум 3)
  const toggleExample = useCallback((id) => {
    setSelectedExampleIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) {
        setError("Нельзя выбрать более 3 примеров");
        return prev;
      }
      setError(null);
      return [...prev, id];
    });
  }, []);

  // Финальное сохранение
  const saveCard = useCallback(async () => {
    setLoading(true);
    const payload = {
      targetPhrases: customPhraseText,
      examples: examples.filter((e) => selectedExampleIds.includes(e.id)),
    };

    console.log("Saving payload to backend:", payload);
    // TODO: await api.saveFlashcard(payload)

    setLoading(false);
    onSaveSuccess();
  }, [customPhraseText, examples, selectedExampleIds, onSaveSuccess]);

  return {
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
  };
};
