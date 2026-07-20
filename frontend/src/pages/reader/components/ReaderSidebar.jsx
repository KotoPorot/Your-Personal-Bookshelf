import React from 'react';

const ReaderSidebar = ({
    onBack,
    onToggleToc,
    onToggleNotes,
    totalSecondsSpent,
    progressPercent,
    navigationData,
    isLiveProgress
}) => {
    const { currentSection, totalSections, currentChapter, totalChapters } = navigationData;

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
            <button className="sidebar-btn back-btn" onClick={onBack}>⬅ Назад</button>
            <button className="sidebar-btn" onClick = {onToggleNotes}>📝 Заметки</button>
            <button className="sidebar-btn" onClick={onToggleToc}>📖 Оглавление</button>
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
                        {isNaN(progressPercent) ? '0.0%' : `${(progressPercent * 100).toFixed(1)}%`}
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