import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext'; // Поправь путь к контексту при необходимости
import { handleRequestError } from '../../../utils/apiErrorHandler'; // Поправь путь к утилитам при необходимости

export const useBookProgress = (bookId) => {
  const { token, logout } = useAuth();
  const cacheKey = `book_progress_${bookId}`;

  const [initialData, setInitialData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Рефы для хранения актуального состояния без провокации лишних рендеров
  const latestDataRef = useRef(null);
  const lastSavedLocalRef = useRef(null);
  const lastSyncedServerRef = useRef(null);

  // Общие заголовки авторизации для Axios
  const apiHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Метод отправки прогресса на сервер
  const updateServer = useCallback(async (dataToSend) => {
    if (!token) return;
    try {
      const response = await axios.patch(
        'http://localhost:8080/api/v1/progress/update',
        dataToSend,
        apiHeaders
      );

      // Фиксируем, что сервер успешно сохранил эту версию данных
      lastSyncedServerRef.current = response.data;
      console.log("[Sync] Прогресс успешно сохранен на сервере.");
    } catch (err) {
      // ИСПРАВЛЕНИЕ ДЕДЛОКА: Сервер отверг наш таймстамп, так как в БД данные новее.
      if (err.response?.status === 400) {
        const actualServerData = err.response.data;
        console.warn("[Sync] Конфликт таймстампов! Данные бэка новее. Синхронизируем фронтенд с сервером.");

        // Накатываем актуальные данные сервера на фронтенд, чтобы остановить цикл ошибок
        localStorage.setItem(cacheKey, JSON.stringify(actualServerData));
        lastSavedLocalRef.current = actualServerData;
        lastSyncedServerRef.current = actualServerData;
        latestDataRef.current = actualServerData;
      } else {
        console.error("[Sync] Ошибка сети при синхронизации:", err);
        handleRequestError(err, logout);
      }
    }
  }, [token, cacheKey, logout]);

  // 1. ПЕРВИЧНАЯ СИНХРОНИЗАЦИЯ ПРИ ОТКРЫТИИ КНИГИ
  useEffect(() => {
    const syncInitialData = async () => {
      if (!token || !bookId) return;

      try {
        let serverData = null;

        // Запрашиваем данные с сервера через Axios
        try {
          const response = await axios.get(
            `http://localhost:8080/api/v1/progress/get/${bookId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          serverData = response.data;
        } catch (err) {
          // Если запись прогресса просто не найдена (например, 404), это нормально для новой книги
          if (err.response?.status !== 404) {
            throw err;
          }
        }

        // Читаем данные из локального кэша
        const cachedRaw = localStorage.getItem(cacheKey);
        const cachedData = cachedRaw ? JSON.parse(cachedRaw) : null;

        let finalData = null;
        let needImmediateSync = false;

        // Сравниваем таймстампы фронтенда (из кэша) и сохраненные на сервере
        if (cachedData && serverData) {
          const cacheTime = new Date(cachedData.timestamp).getTime();
          const serverTime = new Date(serverData.timestamp).getTime();

          if (cacheTime > serverTime) {
            console.log("[Sync] Кэш новее сервера. Используем кэш, готовим апдейт на бэк.");
            finalData = cachedData;
            needImmediateSync = true; // Сервер нужно обновить
          } else {
            console.log("[Sync] Данные сервера свежее или равны кэшу. Обновляем кэш.");
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
          // Абсолютно новая книга
          finalData = {
            bookId: Number(bookId),
            currentCfi: null,
            readingTime: 0,
            progress: 0,
            currentSection: 1,
            numberOfSections: 1,
            currentChapterInSection: 1,
            numberOfChaptersInSection: 1,
            timestamp: new Date().toISOString()
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
        console.error("[Sync] Ошибка при первичной синхронизации, откат на кэш:", err);
        const cachedRaw = localStorage.getItem(cacheKey);
        setInitialData(cachedRaw ? JSON.parse(cachedRaw) : {
          bookId,
          readingTime: 0,
          progress: 0,
          timestamp: new Date().toISOString()
        });
        handleRequestError(err, logout);
      } finally {
        setLoadingProgress(false);
      }
    };

    syncInitialData();
  }, [bookId, cacheKey, token, updateServer, logout]);

  // 2. ФУНКЦИЯ СТРИМИНГА ДАННЫХ ИЗ ИНТЕРФЕЙСА
  const reportLiveProgress = useCallback((data) => {
    latestDataRef.current = {
      bookId: Number(bookId),
      ...data
    };
  }, [bookId]);

  // 3. ТАЙМЕР ЛОКАЛЬНОГО КЭША (Каждые 2 секунды)
  useEffect(() => {
    if (loadingProgress) return;

    const localInterval = setInterval(() => {
      const latest = latestDataRef.current;
      const lastSaved = lastSavedLocalRef.current;

      if (!latest) return;

      const isChanged = !lastSaved ||
        latest.currentCfi !== lastSaved.currentCfi ||
        latest.readingTime !== lastSaved.readingTime;

      if (isChanged) {
        const updatedData = {
          ...latest,
          timestamp: new Date().toISOString() // Свежий таймстамп фронтенда при изменениях
        };
        localStorage.setItem(cacheKey, JSON.stringify(updatedData));
        lastSavedLocalRef.current = updatedData;

        // Синхронизируем таймстамп в основном рефе
        latestDataRef.current.timestamp = updatedData.timestamp;
      }
    }, 2000);

    return () => clearInterval(localInterval);
  }, [loadingProgress, cacheKey]);

  // 4. ТАЙМЕР СИНХРОНИЗАЦИИ С СЕРВЕРОМ (Каждые 30 секунд)
  useEffect(() => {
    if (loadingProgress) return;

    const serverInterval = setInterval(() => {
      const lastSavedLocal = lastSavedLocalRef.current;
      const lastSyncedServer = lastSyncedServerRef.current;

      if (!lastSavedLocal) return;

      // Шлем данные только если локальный кэш обновился (таймстампы не совпадают)
      const needsSync = !lastSyncedServer || lastSavedLocal.timestamp !== lastSyncedServer.timestamp;

      if (needsSync) {
        updateServer(lastSavedLocal);
      }
    }, 30000);

    return () => clearInterval(serverInterval);
  }, [loadingProgress, updateServer]);

  return { initialData, loadingProgress, reportLiveProgress };
};