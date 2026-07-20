import { useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { handleRequestError } from '../../../utils/apiErrorHandler';

import { useEpubLoader } from './reader_sub_hooks/useEpubLoader';
import { useEpubNavigation } from './reader_sub_hooks/useEpubNavigation';
import { useEpubSelection } from './reader_sub_hooks/useEpubSelection';
import { useEpubNotes } from './reader_sub_hooks/useEpubNotes';

export const useEpubReader = (bookId, viewerRef, initialCfi, onLocationChange, bookNotes = [], onNoteClick) => {
    const { token, logout } = useAuth();

    const onLocationChangeRef = useRef(onLocationChange);
    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
    }, [onLocationChange]);

    // 1. Хук загрузки ядра (возвращает bookLoaded)
    const {
        loading, setLoading, error, bookLoaded, bookRef, renditionRef, isBookReadyRef
    } = useEpubLoader(bookId, viewerRef, token, logout, handleRequestError);

    // 2. Хук управления заметками
    const { syncNotesAnnotations } = useEpubNotes(renditionRef, isBookReadyRef, bookNotes, onNoteClick, loading);

    const syncNotesAnnotationsRef = useRef(syncNotesAnnotations);
    useEffect(() => {
        syncNotesAnnotationsRef.current = syncNotesAnnotations;
    }, [syncNotesAnnotations]);

    // 3. Хук навигации и прогресса (прокидываем bookLoaded и убираем отсюда старый дублирующий useEffect)
    const {
        navigationData, progressPercent, toc, handleTocNavigation, handlePrevPage, handleNextPage
    } = useEpubNavigation(bookRef, renditionRef, isBookReadyRef, bookLoaded, initialCfi, onLocationChangeRef, setLoading, syncNotesAnnotationsRef);

    // 4. Хук выделения текста (прокидываем bookLoaded)
    useEpubSelection(renditionRef, onLocationChangeRef, bookLoaded);

    return {
        loading, error, navigationData, progressPercent, toc,
        handleTocNavigation, handlePrevPage, handleNextPage
    };
};