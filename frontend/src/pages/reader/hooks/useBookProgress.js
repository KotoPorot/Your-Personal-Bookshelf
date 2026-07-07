import { useState, useEffect, useCallback } from 'react';

export const useBookProgress = (bookId) => {
    const dbSimulationKey = `mock_backend_progress_${bookId}`;
    const [initialData, setInitialData] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(true);

    useEffect(() => {
        const savedData = localStorage.getItem(dbSimulationKey);
        if (savedData) {
            setInitialData(JSON.parse(savedData));
        } else {
            setInitialData({ currentCfi: undefined, totalTimeSpent: 0, progressPercent: 0 });
        }
        setLoadingProgress(false);
    }, [bookId, dbSimulationKey]);

    // Стабилизируем функцию сохранения
    const saveProgress = useCallback((currentCfi, progressPercent, totalTimeSpent) => {
        localStorage.setItem(dbSimulationKey, JSON.stringify({
            bookId, currentCfi, progressPercent, totalTimeSpent,
            updatedAt: new Date().toISOString()
        }));
    }, [bookId, dbSimulationKey]);

    return { initialData, loadingProgress, saveProgress };
};