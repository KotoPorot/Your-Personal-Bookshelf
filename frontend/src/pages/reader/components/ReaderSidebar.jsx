import React from 'react';
import { useReader } from '../context/ReaderContext';

const ReaderSidebar = () => {
    const { state, actions } = useReader();

    const {
        totalSecondsSpent,
        displayedProgress,
        displayedNav,
        isLiveProgress,
        isTocOpen
    } = state;

    const { currentSection, totalSections, currentChapter, totalChapters } = displayedNav;

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    };

    return (
        <aside className="reader-sidebar">
            <div className="sidebar-actions">
                <button className="sidebar-btn back-btn" onClick={actions.closeReader}>⬅ Назад</button>
                <button className="sidebar-btn" onClick={actions.handleToggleNotesList}>📝 Заметки</button>
                <button className="sidebar-btn" onClick={() => actions.setIsTocOpen(!isTocOpen)}>📖 Оглавление</button>
            </div>

            <div className={`meta-panel ${isLiveProgress ? 'status-live' : 'status-backend'}`}>
                <h3>Статистика</h3>
                <div className="meta-item">
                    <span className="meta-label">Времени в книге:</span>
                    <span className="meta-value time-value">{formatTime(totalSecondsSpent)}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Прогресс:</span>
                    <span className="meta-value progress-value">
                        {isNaN(displayedProgress) ? '0.0%' : `${(displayedProgress * 100).toFixed(1)}%`}
                    </span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Раздел:</span>
                    <span className="meta-value">{currentSection} из {totalSections}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Глава в разделе:</span>
                    <span className="meta-value">{currentChapter} из {totalChapters}</span>
                </div>
            </div>
        </aside>
    );
};

export default ReaderSidebar;