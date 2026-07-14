import { useEffect, useState, useCallback } from 'react';

export const useReadingTimer = (initialSeconds = 0) => {
    const [totalSecondsSpent, setTotalSecondsSpent] = useState(initialSeconds);
    const [isIdle, setIsIdle] = useState(false);
    const [timeLimit, setTimeLimit] = useState(30);
    const [currentPageSeconds, setCurrentPageSeconds] = useState(0);

    useEffect(() => {
        setTotalSecondsSpent(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (isIdle) return;

        const interval = setInterval(() => {
            setTotalSecondsSpent(prev => prev + 1);
            setCurrentPageSeconds(prev => {
                const next = prev + 1;
                if (next >= timeLimit) {
                    console.warn(`%c[Таймер Неактивности]%c Пользователь не листает книгу уже %c${timeLimit} сек.%c! Включаем окно проверки "Вы здесь?". Прекращаем учет общего времени.`,
                        'color: #dc3545; font-weight: bold;', 'color: inherit;',
                        'color: #dc3545; font-weight: bold;', 'color: inherit;'
                    );
                    setIsIdle(true);
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isIdle, timeLimit]);

    const startPage = useCallback((newTimeLimit) => {
        console.log(
            `%c[Таймер]%c Страница изменена. Таймер текущей страницы сброшен в 0. Новый лимит неактивности: %c${newTimeLimit} сек.%c`,
            'color: #28a745; font-weight: bold;', 'color: inherit;',
            'color: #28a745; font-weight: bold;', 'color: inherit;'
        );

        setTimeLimit(newTimeLimit);
        setCurrentPageSeconds(0);
        setIsIdle(false);
    }, []);

    const resetIdle = useCallback(() => {
        console.log(
            `%c[Таймер]%c Активность подтверждена кликом! Окно скрыто. Счетчик секунд текущей страницы обнулен. Лимит времени для этой страницы остается: %c${timeLimit} сек.%c`,
            'color: #17a2b8; font-weight: bold;', 'color: inherit;',
            'color: #17a2b8; font-weight: bold;', 'color: inherit;'
        );

        setIsIdle(false);
        setCurrentPageSeconds(0);
    }, [timeLimit]);

    return { totalSecondsSpent, isIdle, startPage, resetIdle };
};