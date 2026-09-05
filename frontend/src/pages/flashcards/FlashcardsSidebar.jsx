const FlashcardsSidebar = ({
	folders,
	activeFolderId,
	onSelectFolder,
	onCreateFolder,
	onEditFolder,
	onDeleteFolder,
}) => {
	return (
		<aside className="bookshelf-sidebar">
			<div className="sidebar-top">
				<h3 className="sidebar__title">Мои папки</h3>
				<button className="create-shelf-btn" onClick={onCreateFolder}>
					+ Новая папка
				</button>
			</div>

			<ul className="shelf-list">
				{folders.map((folder) => (
					<li
						key={folder.id}
						className={`shelf-item ${folder.id === activeFolderId ? "active" : ""}`}
						onClick={() => onSelectFolder(folder.id)}
					>
						<span className="shelf-name">📁 {folder.name}</span>

						<div className="shelf-actions" onClick={(e) => e.stopPropagation()}>
							<button
								className="action-btn edit-btn"
								title="Переименовать"
								onClick={() => onEditFolder(folder.id)}
							>
								✏️
							</button>
							<button
								className="action-btn delete-btn"
								title="Удалить"
								onClick={() => onDeleteFolder(folder.id)}
							>
								🗑️
							</button>
						</div>
					</li>
				))}
			</ul>
		</aside>
	);
};

export default FlashcardsSidebar;
