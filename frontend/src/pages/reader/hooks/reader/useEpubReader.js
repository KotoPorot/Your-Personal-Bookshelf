// src/pages/reader/hooks/reader/useEpubReader.js
import { useEffect, useRef } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { handleRequestError } from '../../../../utils/apiErrorHandler';

// Соседние хуки из папки reader
import { useEpubLoader } from './useEpubLoader';
import { useEpubNavigation } from './useEpubNavigation';

// Хуки из других тематических папок
import { useEpubNotes } from '../notes/useEpubNotes';
import { useEpubSelection } from '../text_selection/useEpubSelection';
import { useEpubHighlight } from '../text_selection/useEpubHighlight'; // <-- Добавили новый импорт

export const useEpubReader = (bookId, viewerRef, initialCfi, onLocationChange, onNoteClick, bookNotes = []) => {
    const { token, logout } = useAuth();

    const onLocationChangeRef = useRef(onLocationChange);
    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
    }, [onLocationChange]);

    // 1. Хук загрузки ядра книги
    const {
        loading, setLoading, error, bookLoaded, bookRef, renditionRef, isBookReadyRef
    } = useEpubLoader(bookId, viewerRef, token, logout, handleRequestError);

    // 2. Инициализируем низкоуровневый менеджер хайлайтов
    const highlightManager = useEpubHighlight(renditionRef);

    // 3. Хук управления логикой заметок (теперь передаем highlightManager последним аргументом)
    const { forceFullSync } = useEpubNotes(
        isBookReadyRef,
        bookNotes,
        onNoteClick,
        loading,
        highlightManager // <-- Отдали методы точечной подсветки внутрь диспетчера заметок
    );

    const forceFullSyncRef = useRef(forceFullSync);
    useEffect(() => {
        forceFullSyncRef.current = forceFullSync;
    }, [forceFullSync]);

    // 4. Хук навигации и прогресса (передаем реф принудительной синхронизации вместо старого syncNotesAnnotations)
    const {
        navigationData, progressPercent, toc, handleTocNavigation, handlePrevPage, handleNextPage
    } = useEpubNavigation(bookRef, renditionRef, isBookReadyRef, bookLoaded, initialCfi, onLocationChangeRef, setLoading, forceFullSyncRef);

    // 5. Хук выделения текста
    useEpubSelection(renditionRef, onLocationChangeRef, bookLoaded, highlightManager);

    return {
        loading, error, navigationData, progressPercent, toc,
        handleTocNavigation, handlePrevPage, handleNextPage
    };
};