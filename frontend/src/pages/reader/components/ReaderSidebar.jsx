import React from 'react';

const ReaderSidebar = ({
    onBack,
    onToggleToc,
    totalSecondsSpent,
    progressPercent,
    navigationData
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
            <button className="sidebar-btn" onClick={onBack}>⬅ Назад</button>
            <button className="sidebar-btn">📝 Заметки</button>
            <button className="sidebar-btn" onClick={onToggleToc}>📖 Оглавление</button>

            <div className="meta-panel">
                <h3>Статистика</h3>
                <div className="meta-item">
                    <span className="meta-label">Времени в книге:</span>
                    <span className="meta-value">{formatTime(totalSecondsSpent)}</span>
                </div>
                <div className="meta-item">
                    <span className="meta-label">Прогресс:</span>
                    <span className="meta-value">
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