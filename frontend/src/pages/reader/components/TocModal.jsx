import { useState, useEffect } from "react";
import { useReader } from "../context/ReaderContext";

const TocModal = () => {
	const { state, actions } = useReader();
	const { isTocOpen, toc, displayedNav } = state;
	const { currentSection, currentChapter } = displayedNav;

	// Храним индекс раскрытого раздела сборника
	const [expandedSection, setExpandedSection] = useState(null);

	// Автоматически раскрываем текущий читаемый раздел при открытии оглавления
	useEffect(() => {
		if (isTocOpen && currentSection) {
			setExpandedSection(currentSection - 1);
		}
	}, [isTocOpen, currentSection]);

	if (!isTocOpen) return null;

	const toggleSection = (idx) => {
		setExpandedSection(expandedSection === idx ? null : idx);
	};

	const handleClose = () => actions.setIsTocOpen(false);

	return (
		<div className="toc-overlay" onClick={handleClose}>
			<div className="toc-card" onClick={(e) => e.stopPropagation()}>
				<div className="toc-header">
					<h3>Оглавление сборника</h3>
					<button className="toc-close-btn" onClick={handleClose}>
						✕
					</button>
				</div>
				<div className="toc-list-container">
					{toc.length === 0 ? (
						<div className="toc-empty">Оглавление загружается...</div>
					) : (
						<ul className="toc-list">
							{toc.map((section, idx) => {
								const isExpanded = expandedSection === idx;
								const isCurrentSection = currentSection === idx + 1;

								return (
									<li key={idx} className="toc-section-item">
										{/* Кнопка-заголовок Раздела */}
										<button
											className={`toc-section-btn ${isCurrentSection ? "active-section" : ""}`}
											onClick={() => toggleSection(idx)}
										>
											<span className="toc-arrow">
												{isExpanded ? "▼" : "▶"}
											</span>
											<span className="toc-section-label">
												{section.label
													? section.label.trim()
													: `Раздел ${idx + 1}`}
											</span>
										</button>

										{/* Выпадающий список глав */}
										{isExpanded && section.chapters && (
											<ul className="toc-sub-list">
												{section.chapters.map((chap, cIdx) => {
													const isCurrentChap =
														isCurrentSection &&
														currentChapter === chap.chapterNum;

													return (
														<li key={cIdx} className="toc-sub-item">
															<button
																className={`toc-sub-btn ${isCurrentChap ? "active-sub-chapter" : ""}`}
																onClick={() =>
																	actions.handleJumpToChapter(chap.href)
																}
															>
																{chap.label}
															</button>
														</li>
													);
												})}
											</ul>
										)}
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
};

export default TocModal;
