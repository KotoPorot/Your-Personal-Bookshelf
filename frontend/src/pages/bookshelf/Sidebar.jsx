import "./styles/Sidebar.css";

const Sidebar = ({
	shelves,
	activeShelfId,
	onSelectShelf,
	onCreateShelf,
	onEditShelf,
	onDeleteShelf,
}) => {
	return (
		<aside className="bookshelf-sidebar">
			<div className="sidebar-top">
				<h3 className="sidebar__title">My shelves</h3>
				<button className="create-shelf-btn" onClick={onCreateShelf}>
					+ New shelf
				</button>
			</div>

			<ul className="shelf-list">
				{shelves.map((shelf) => (
					<li
						key={shelf.id}
						className={`shelf-item ${shelf.id === activeShelfId ? "active" : ""}`}
						onClick={() => onSelectShelf(shelf.id)}
					>
						<span className="shelf-name">{shelf.shelfName}</span>

						{/* Кнопки управления полкой */}
						<div className="shelf-actions" onClick={(e) => e.stopPropagation()}>
							{/* stopPropagation нужен, чтобы клик по настройкам не переключал саму полку */}
							<button
								className="action-btn edit-btn"
								title="Переименовать"
								onClick={() => onEditShelf(shelf.id)}
							>
								✏️
							</button>
							<button
								className="action-btn delete-btn"
								title="Удалить"
								onClick={() => onDeleteShelf(shelf.id)}
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

export default Sidebar;
