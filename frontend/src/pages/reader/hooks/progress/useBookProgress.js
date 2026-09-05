import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContext";
import { handleRequestError } from "../../../../utils/apiErrorHandler";

export const useBookProgress = (bookId) => {
  const { token, logout } = useAuth();
  const cacheKey = `book_progress_${bookId}`;

  const [initialData, setInitialData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const latestDataRef = useRef(null);
  const lastSavedLocalRef = useRef(null);
  const lastSyncedServerRef = useRef(null);

  const apiHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  // Метод отправки прогресса на сервер (Стандартный Axios)
  const updateServer = useCallback(
    async (dataToSend) => {
      if (!token) return;
      try {
        const response = await axios.patch(
          "https://your-personal-bookshelf.onrender.com/api/v1/progress/update",
          dataToSend,
          apiHeaders,
        );

        lastSyncedServerRef.current = response.data;
        console.log("[Sync] Прогресс успешно сохранен на сервере.");
      } catch (err) {
        if (err.response?.status === 400) {
          const actualServerData = err.response.data;
          console.warn(
            "[Sync] Конфликт таймстампов! Данные бэка новее. Синхронизируем фронтенд с сервером.",
          );

          localStorage.setItem(cacheKey, JSON.stringify(actualServerData));
          lastSavedLocalRef.current = actualServerData;
          lastSyncedServerRef.current = actualServerData;
          latestDataRef.current = actualServerData;
        } else {
          console.error("[Sync] Ошибка сети при синхронизации:", err);
          handleRequestError(err, logout);
        }
      }
    },
    [token, cacheKey, logout],
  );

  // ОПТИМИЗАЦИЯ: Гарантированный синк методом keepalive при экстренном закрытии вкладки
  const syncOnClose = useCallback(() => {
    const lastSavedLocal = lastSavedLocalRef.current;
    const lastSyncedServer = lastSyncedServerRef.current;

    if (!lastSavedLocal || !token) return;

    // Проверяем, есть ли неотправленные изменения
    const needsSync =
      !lastSyncedServer ||
      lastSavedLocal.timestamp !== lastSyncedServer.timestamp;

    if (needsSync) {
      console.log(
        "[Sync] Обнаружены неотправленные данные. Запуск незакрываемого keepalive-запроса...",
      );

      // Используем native fetch + keepalive, чтобы браузер доставил запрос даже после закрытия вкладки
      fetch(
        "https://your-personal-bookshelf.onrender.com/api/v1/progress/update",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lastSavedLocal),
          keepalive: true,
        },
      ).catch((err) =>
        console.error("[Sync] Ошибка экстренной отправки:", err),
      );

      // Фиксируем отправку в рефе
      lastSyncedServerRef.current = lastSavedLocal;
    }
  }, [token]);

  // 1. ПЕРВИЧНАЯ СИНХРОНИЗАЦИЯ ПРИ ОТКРЫТИИ КНИГИ (Без изменений)
  useEffect(() => {
    const syncInitialData = async () => {
      if (!token || !bookId) return;

      try {
        let serverData = null;
        try {
          const response = await axios.get(
            `https://your-personal-bookshelf.onrender.com/api/v1/progress/get/${bookId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          serverData = response.data;
        } catch (err) {
          if (err.response?.status !== 404) throw err;
        }

        const cachedRaw = localStorage.getItem(cacheKey);
        const cachedData = cachedRaw ? JSON.parse(cachedRaw) : null;

        let finalData = null;
        let needImmediateSync = false;

        if (cachedData && serverData) {
          const cacheTime = new Date(cachedData.timestamp).getTime();
          const serverTime = new Date(serverData.timestamp).getTime();

          if (cacheTime > serverTime) {
            console.log(
              "[Sync] Кэш новее сервера. Используем кэш, готовим апдейт на бэк.",
            );
            finalData = cachedData;
            needImmediateSync = true;
          } else {
            console.log(
              "[Sync] Данные сервера свежее или равны кэшу. Обновляем кэш.",
            );
            finalData = serverData;
            localStorage.setItem(cacheKey, JSON.stringify(serverData));
          }
        } else if (serverData) {
          finalData = serverData;
          localStorage.setItem(cacheKey, JSON.stringify(serverData));
        } else if (cachedData) {
          finalData = cachedData;
          needImmediateSync = true;
        } else {
          finalData = {
            bookId: Number(bookId),
            currentCfi: null,
            readingTime: 0,
            progress: 0,
            currentSection: 1,
            numberOfSections: 1,
            currentChapterInSection: 1,
            numberOfChaptersInSection: 1,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(cacheKey, JSON.stringify(finalData));
        }

        setInitialData(finalData);
        lastSavedLocalRef.current = finalData;

        if (needImmediateSync) {
          lastSyncedServerRef.current = null;
          updateServer(finalData);
        } else {
          lastSyncedServerRef.current = finalData;
        }
      } catch (err) {
        console.error(
          "[Sync] Ошибка при первичной синхронизации, откат на кэш:",
          err,
        );
        const cachedRaw = localStorage.getItem(cacheKey);
        setInitialData(
          cachedRaw
            ? JSON.parse(cachedRaw)
            : {
                bookId,
                readingTime: 0,
                progress: 0,
                timestamp: new Date().toISOString(),
              },
        );
        handleRequestError(err, logout);
      } finally {
        setLoadingProgress(false);
      }
    };

    syncInitialData();
  }, [bookId, cacheKey, token, updateServer, logout]);

  // 2. ФУНКЦИЯ СТРИМИНГА ДАННЫХ ИЗ ИНТЕРФЕЙСА (Без изменений)
  const reportLiveProgress = useCallback(
    (data) => {
      latestDataRef.current = {
        bookId: Number(bookId),
        ...data,
      };
    },
    [bookId],
  );

  // 3. ТАЙМЕР ЛОКАЛЬНОГО КЭША (Без изменений)
  useEffect(() => {
    if (loadingProgress) return;

    const localInterval = setInterval(() => {
      const latest = latestDataRef.current;
      const lastSaved = lastSavedLocalRef.current;

      if (!latest) return;

      const isChanged =
        !lastSaved ||
        latest.currentCfi !== lastSaved.currentCfi ||
        latest.readingTime !== lastSaved.readingTime;

      if (isChanged) {
        const updatedData = {
          ...latest,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(cacheKey, JSON.stringify(updatedData));
        lastSavedLocalRef.current = updatedData;
        latestDataRef.current.timestamp = updatedData.timestamp;
      }
    }, 2000);

    return () => clearInterval(localInterval);
  }, [loadingProgress, cacheKey]);

  // 4. ТАЙМЕР СИНХРОНИЗАЦИИ С СЕРВЕРОМ + ОПТИМИЗАЦИЯ UNMOUNT (Размонтирование)
  useEffect(() => {
    if (loadingProgress) return;

    const serverInterval = setInterval(() => {
      const lastSavedLocal = lastSavedLocalRef.current;
      const lastSyncedServer = lastSyncedServerRef.current;

      if (!lastSavedLocal) return;

      const needsSync =
        !lastSyncedServer ||
        lastSavedLocal.timestamp !== lastSyncedServer.timestamp;

      if (needsSync) {
        updateServer(lastSavedLocal);
      }
    }, 30000);

    // ОПТИМИЗАЦИЯ: При уходе со страницы (клик «Назад»), мгновенно пушим «хвост» прогресса
    return () => {
      clearInterval(serverInterval);

      const lastSavedLocal = lastSavedLocalRef.current;
      const lastSyncedServer = lastSyncedServerRef.current;

      if (
        lastSavedLocal &&
        (!lastSyncedServer ||
          lastSavedLocal.timestamp !== lastSyncedServer.timestamp)
      ) {
        console.log(
          "[Sync] Хук размонтирован. Выполняется финальный синк данных...",
        );
        updateServer(lastSavedLocal);
      }
    };
  }, [loadingProgress, updateServer]);

  // 5. ОПТИМИЗАЦИЯ: Подписка на сворачивание / закрытие вкладки браузера
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        syncOnClose();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncOnClose]);

  return { initialData, loadingProgress, reportLiveProgress };
};
