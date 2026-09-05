import { useState, useEffect } from "react";
import axios from "axios";

export const useBookProgress = (bookId, token) => {
  const [progressData, setProgressData] = useState({
    progressPercent: 0,
    readingTime: 0,
    currentSection: 0,
    numberOfSections: 0,
    currentChapterInSection: 0,
    numberOfChaptersInSection: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookId || !token) {
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      try {
        // ИСПРАВЛЕНО: Заменили {bookId} на ${bookId} для корректной интерполяции
        const response = await axios.get(
          `https://your-personal-bookshelf.onrender.com/api/v1/progress/get/${bookId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = response.data;

        if (data) {
          // Обработка процента (из 0.45 в 45%)
          const rawPercent = data.progress || 0;
          const finalPercent =
            rawPercent <= 1 && rawPercent > 0
              ? Math.round(rawPercent * 100)
              : Math.round(rawPercent);

          setProgressData({
            progressPercent: finalPercent,
            readingTime: data.readingTime || 0,
            currentSection: data.currentSection || 0,
            numberOfSections: data.numberOfSections || 0,
            currentChapterInSection: data.currentChapterInSection || 0,
            numberOfChaptersInSection: data.numberOfChaptersInSection || 0,
          });
        }
      } catch (err) {
        console.error("Не удалось загрузить прогресс чтения:", err);
        // При ошибке сбрасываем в дефолтные значения
        setProgressData({
          progressPercent: 0,
          readingTime: 0,
          currentSection: 0,
          numberOfSections: 0,
          currentChapterInSection: 0,
          numberOfChaptersInSection: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [bookId, token]);

  return { progressData, loading };
};
