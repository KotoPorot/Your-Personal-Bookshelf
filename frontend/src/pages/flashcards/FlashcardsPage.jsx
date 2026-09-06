import { useState, useEffect } from "react";
import Header from "../bookshelf/Header";
import FlashcardsSidebar from "./FlashcardsSidebar";
import FlashcardGrid from "./FlashcardGrid";
import FlashcardModal from "./FlashcardModal";
import { useAuth } from "../../context/AuthContext";
import { useFolder } from "../../context/FolderContext";
import { useFlashcards } from "../../context/FlashcardContext"; // 👈 Импорт карточек

const FlashcardsPage = () => {
	const { username, logout } = useAuth();
	const {
		folders,
		activeFolderId,
		setActiveFolderId,
		createFolder,
		updateFolder,
		deleteFolder,
		loading: folderLoading,
		error: folderError,
	} = useFolder();

	const {
		cards,
		fetchCardsByFolder,
		loading: cardsLoading,
		error: cardsError,
	} = useFlashcards();

	const [selectedCard, setSelectedCard] = useState(null);

	// Автоматически подгружаем карточки при смене активной папки
	useEffect(() => {
		if (activeFolderId) {
			fetchCardsByFolder(activeFolderId);
		}
	}, [activeFolderId, fetchCardsByFolder]);

	const handleCreateFolder = async () => {
		const name = prompt("Введите название новой папки:");
		if (name && name.trim()) {
			try {
				await createFolder(name.trim());
			} catch (err) {
				alert("Ошибка при создании папки: " + err.message);
			}
		}
	};

	const handleEditFolder = async (id) => {
		const folder = folders.find((f) => f.id === id);
		const newName = prompt("Изменить название папки:", folder?.name);
		if (newName && newName.trim() && newName !== folder?.name) {
			try {
				await updateFolder(id, newName.trim());
			} catch (err) {
				alert("Ошибка при обновлении папки: " + err.message);
			}
		}
	};

	const handleDeleteFolder = async (id) => {
		if (window.confirm("Удалить папку со всеми карточками?")) {
			try {
				await deleteFolder(id);
			} catch (err) {
				alert("Ошибка при удалении папки: " + err.message);
			}
		}
	};

	return (
		<div className="bookshelf-layout">
			<Header username={username} onLogout={logout} />

			<div className="bookshelf-main">
				{(folderLoading || cardsLoading) && (
					<div className="loading-bar">Загрузка данных...</div>
				)}
				{(folderError || cardsError) && (
					<div className="error-banner">{folderError || cardsError}</div>
				)}

				<FlashcardsSidebar
					folders={folders}
					activeFolderId={activeFolderId}
					onSelectFolder={setActiveFolderId}
					onCreateFolder={handleCreateFolder}
					onEditFolder={handleEditFolder}
					onDeleteFolder={handleDeleteFolder}
				/>

				<main className="bookshelf-content">
					<div className="content-header">
						<h2 className="shelf-title">
							{folders.find((f) => f.id === activeFolderId)?.name ||
								"Папка не выбрана"}
						</h2>
					</div>

					<FlashcardGrid
						cards={cards}
						activeFolderId={activeFolderId}
						onCardClick={setSelectedCard}
					/>
				</main>
			</div>

			{selectedCard && (
				<FlashcardModal
					isOpen={true}
					card={selectedCard}
					folders={folders}
					onClose={() => setSelectedCard(null)}
				/>
			)}
		</div>
	);
};

export default FlashcardsPage;
