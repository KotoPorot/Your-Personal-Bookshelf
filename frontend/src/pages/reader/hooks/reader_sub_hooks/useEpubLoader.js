import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ePub from 'epubjs';

export const useEpubLoader = (bookId, viewerRef, token, logout, handleRequestError) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // КЛЮЧЕВОЙ ФИКС: Стейт-сигнал для реактивного пробуждения остальных хуков
    const [bookLoaded, setBookLoaded] = useState(false);

    const bookRef = useRef(null);
    const renditionRef = useRef(null);
    const isInitializing = useRef(false);
    const isBookReadyRef = useRef(false);

    useEffect(() => {
        let isMounted = true;
        if (!viewerRef.current || bookRef.current || isInitializing.current) return;

        const loadBook = async () => {
            try {
                isInitializing.current = true;
                setLoading(true);
                setBookLoaded(false);
                isBookReadyRef.current = false;

                if (!token) throw new Error('Нет токена доступа');

                const response = await axios.get(`http://localhost:8080/api/v1/books/getBook/${bookId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'arraybuffer'
                });

                if (!isMounted) return;

                const book = ePub();
                bookRef.current = book;
                await book.open(response.data);

                if (!isMounted) return;

                const rendition = book.renderTo(viewerRef.current, {
                    width: '100%',
                    height: '100%',
                    flow: 'paginated',
                    manager: 'default',
                    allowScriptedContent: true
                });

                renditionRef.current = rendition;

                rendition.themes.default({
                    '.book-note-highlight': {
                        'fill': '#ffc107 !important',
                        'fill-opacity': '0.35 !important',
                        'mix-blend-mode': 'multiply',
                        'cursor': 'pointer'
                    },
                    '.tmp-selection-highlight': {
                        'fill': '#007bff !important',
                        'fill-opacity': '0.3 !important',
                        'mix-blend-mode': 'multiply'
                    }
                });

                // Рефы заполнены инстансами EpubJS, даем зеленый свет остальным хукам
                setBookLoaded(true);

            } catch (err) {
                if (isMounted) {
                    setError('Ошибка при загрузке книги');
                    setLoading(false);
                    handleRequestError(err, logout);
                }
            } finally {
                isInitializing.current = false;
            }
        };

        loadBook();

        return () => {
            isMounted = false;
            if (renditionRef.current) renditionRef.current.destroy();
            if (bookRef.current) bookRef.current.destroy();
        };
    }, [bookId, token, logout, viewerRef, handleRequestError]);

    return { loading, setLoading, error, bookLoaded, bookRef, renditionRef, isBookReadyRef };
};