import { useReader } from "../context/ReaderContext";
import { useAuth } from "../../../context/AuthContext";
import TranslatorSettingsPanel from "./TranslatorSettingsPanel.jsx";
import { useState } from "react";

const ReaderSidebar = () => {
	const { state, actions } = useReader();
	const { setCurrentScreen } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const {
		totalSecondsSpent,
		displayedProgress,
		displayedNav,
		isLiveProgress,
		isTocOpen,
	} = state;

	const { currentSection, totalSections, currentChapter, totalChapters } =
		displayedNav;

	const formatTime = (totalSeconds) => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return [
			hours.toString().padStart(2, "0"),
			minutes.toString().padStart(2, "0"),
			seconds.toString().padStart(2, "0"),
		].join(":");
	};

	return (
		<aside className="reader-sidebar">
			{isMenuOpen && (
				<div className="menu-nav">
					<div className="menu-nav__content">
						<button
							className="menu-close-btn"
							onClick={() => setIsMenuOpen(false)}
						>
							✖ Close
						</button>
						<button
							className="sidebar-btn flashcards-btn menu-nav__item"
							onClick={() => setCurrentScreen("flashcards")}
						>
							🃏 Flashcards
						</button>
						<TranslatorSettingsPanel menuNav__item={true} />
						<div
							className={`meta-panel menu-nav__item ${isLiveProgress ? "status-live" : "status-backend"}`}
						>
							<h3>Статистика</h3>
							<div className="meta-item">
								<span className="meta-label">Времени в книге:</span>
								<span className="meta-value time-value">
									{formatTime(totalSecondsSpent)}
								</span>
							</div>
							<div className="meta-item">
								<span className="meta-label">Прогресс:</span>
								<span className="meta-value progress-value">
									{isNaN(displayedProgress)
										? "0.0%"
										: `${(displayedProgress * 100).toFixed(1)}%`}
								</span>
							</div>
							<div className="meta-item">
								<span className="meta-label">Раздел:</span>
								<span className="meta-value">
									{currentSection} из {totalSections}
								</span>
							</div>
							<div className="meta-item">
								<span className="meta-label">Глава в разделе:</span>
								<span className="meta-value">
									{currentChapter} из {totalChapters}
								</span>
							</div>
						</div>
					</div>
					/
				</div>
			)}
			<div className="sidebar-actions">
				<button className="sidebar-btn back-btn" onClick={actions.closeReader}>
					⬅ Back
				</button>
				<button className="sidebar-btn" onClick={actions.handleToggleNotesList}>
					📝 Notes
				</button>
				<button
					className="sidebar-btn"
					onClick={() => actions.setIsTocOpen(!isTocOpen)}
				>
					📖 Оглавление
				</button>
				<button
					className="sidebar-btn flashcards-btn"
					onClick={() => setCurrentScreen("flashcards")}
				>
					🃏 Flashcards
				</button>
				<button className="hamburger-menu" onClick={() => setIsMenuOpen(true)}>
					☰
				</button>
			</div>
			<TranslatorSettingsPanel menu-nav__item={false} />
			<div
				className={`meta-panel ${isLiveProgress ? "status-live" : "status-backend"}`}
			>
				<h3>Статистика</h3>
				<div className="meta-item">
					<span className="meta-label">Времени в книге:</span>
					<span className="meta-value time-value">
						{formatTime(totalSecondsSpent)}
					</span>
				</div>
				<div className="meta-item">
					<span className="meta-label">Прогресс:</span>
					<span className="meta-value progress-value">
						{isNaN(displayedProgress)
							? "0.0%"
							: `${(displayedProgress * 100).toFixed(1)}%`}
					</span>
				</div>
				<div className="meta-item">
					<span className="meta-label">Раздел:</span>
					<span className="meta-value">
						{currentSection} из {totalSections}
					</span>
				</div>
				<div className="meta-item">
					<span className="meta-label">Глава в разделе:</span>
					<span className="meta-value">
						{currentChapter} из {totalChapters}
					</span>
				</div>
			</div>
		</aside>
	);
};

export default ReaderSidebar;
