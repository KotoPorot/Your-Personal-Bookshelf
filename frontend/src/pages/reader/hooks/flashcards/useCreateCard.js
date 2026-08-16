// src/pages/reader/hooks/flashcards/useCreateCard.js
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../../context/AuthContext";

const API_BASE = "http://localhost:8080/api/v1/ai";

export const useCreateCard = (cardData, targetLang = "EN") => {
  const { token } = useAuth();

  const [loadingDef, setLoadingDef] = useState(false);
  const [loadingExamples, setLoadingExamples] = useState(false);

  // Определение (Definition)
  const [definition, setDefinition] = useState("");
  const [initialDefinition, setInitialDefinition] = useState(""); // Для oldValue
  const [defRegenerating, setDefRegenerating] = useState(false);

  // Примеры (Examples)
  // Внутренний элемент state: { id, sentence, clozeSentence, translation, initialSentence }
  const [examples, setExamples] = useState([]);
  const [exampleLoadingIds, setExampleLoadingIds] = useState({});

  const phraseText = cardData?.sourceText || cardData?.phrase || "";
  const phraseTranslation = cardData?.translation || "";
  // 1. Загрузка первичного определения
  const fetchDefinition = useCallback(async () => {
    if (!phraseText) return;
    setLoadingDef(true);
    try {
      const res = await fetch(`${API_BASE}/definition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ phrase: phraseText, targetLang }),
      });
      if (res.ok) {
        const data = await res.json();
        const defText = data.definition || "";
        setDefinition(defText);
        setInitialDefinition(defText);
      }
    } catch (err) {
      console.error("Ошибка загрузки определения:", err);
    } finally {
      setLoadingDef(false);
    }
  }, [phraseText, targetLang, token]);

  // 2. Загрузка первичных примеров (Маппинг под SimpleExample DTO)
  const fetchExamples = useCallback(async () => {
    if (!phraseText) return;
    setLoadingExamples(true);
    try {
      const res = await fetch(`${API_BASE}/examples`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ phrase: phraseText, targetLang }),
      });
      if (res.ok) {
        const data = await res.json();
        // 👈 Читаем поля example и withoutTargetWord из SimpleExample DTO
        const formatted = data.map((ex, idx) => ({
          id: Date.now() + idx,
          sentence: ex.example || "",
          clozeSentence: ex.withoutTargetWord || "",
          translation: ex.translation || "",
          initialSentence: ex.example || "",
        }));
        setExamples(formatted);
      }
    } catch (err) {
      console.error("Ошибка загрузки примеров:", err);
    } finally {
      setLoadingExamples(false);
    }
  }, [phraseText, targetLang, token]);

  useEffect(() => {
    if (phraseText) {
      fetchDefinition();
      fetchExamples();
    }
  }, [phraseText, fetchDefinition, fetchExamples]);

  // 3. Перегенерация определения
  const handleRegenerateDefinition = async () => {
    setDefRegenerating(true);
    try {
      const res = await fetch(`${API_BASE}/regenerate-definition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          phrase: phraseText,
          targetLang,
          oldValue: initialDefinition || definition,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newDef = data.definition || "";
        setDefinition(newDef);
        setInitialDefinition(newDef);
      }
    } catch (err) {
      console.error("Ошибка перегенерации определения:", err);
    } finally {
      setDefRegenerating(false);
    }
  };

  // 4. Перегенерация конкретного примера (Маппинг под SimpleExample DTO)
  const handleRegenerateExample = async (id) => {
    const targetEx = examples.find((e) => e.id === id);
    if (!targetEx) return;

    setExampleLoadingIds((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`${API_BASE}/regenerate-example`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          phrase: phraseText,
          targetLang,
          oldValue: targetEx.initialSentence || targetEx.sentence,
        }),
      });
      if (res.ok) {
        const newEx = await res.json();
        // 👈 Берем newEx.example и newEx.withoutTargetWord
        setExamples((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  sentence: newEx.example || item.sentence,
                  clozeSentence: newEx.withoutTargetWord || item.clozeSentence,
                  translation: newEx.translation || item.translation,
                  initialSentence: newEx.example || item.sentence,
                }
              : item,
          ),
        );
      }
    } catch (err) {
      console.error("Ошибка перегенерации примера:", err);
    } finally {
      setExampleLoadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  // 5. Удаление примера
  const handleDeleteExample = (id) => {
    setExamples((prev) => prev.filter((item) => item.id !== id));
  };

  // 6. Ручное редактирование полей
  const updateExampleField = (id, field, value) => {
    setExamples((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    );
  };

  // 7. Сохранение карточки
  const handleSaveCard = (folderId) => {
    const payload = {
      folderId: Number(folderId),
      phrase: phraseText,
      phraseTranslation: phraseTranslation,
      targetLang: targetLang,
      definition: definition,
      examples: examples.map((ex) => ({
        example: ex.sentence,
        translation: ex.translation,
        withoutTargetWord: ex.clozeSentence,
      })),
    };

    console.log("💾 [Payload сохранения карточки]:", payload);
    return payload;
  };

  return {
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
  };
};
