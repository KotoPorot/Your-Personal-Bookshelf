import React, { useState } from 'react';

const AddBookModal = ({ activeShelfId, onClose, onUpload }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');

    // Заглушка под будущий файл
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Для удобства пользователя автоматически вытащим имя файла в название, если поле пустое
            if (!title) {
                const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                setTitle(fileNameWithoutExt);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !author.trim()) {
            alert('Укажите название книги и автора!');
            return;
        }

        // Формируем объект новой книги
        const newBook = {
            id: Date.now(),
            shelfId: activeShelfId,
            title: title.trim(),
            author: author.trim(),
            pages: Math.floor(Math.random() * 300) + 150, // пока заглушка для страниц
            status: 'planned', // новая книга по умолчанию идет в планы
            description: selectedFile ? `Файл: ${selectedFile.name}` : 'Загружено без файла'
        };

        onUpload(newBook);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Загрузка новой книги (.fb2, .epub)</h3>
                    <button className="close-modal-btn" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {/* Область для будущего перетаскивания файлов */}
                    <div className="file-upload-zone">
                        <label className="file-label">
                            <span className="upload-icon">📁</span>
                            <span className="upload-text">
                                {selectedFile ? `Выбран файл: ${selectedFile.name}` : 'Выберите файл FB2 или EPUB'}
                            </span>
                            <input
                                type="file"
                                accept=".fb2,.epub"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Название книги *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Введи название или оно определится из файла"
                        />
                    </div>

                    <div className="form-group">
                        <label>Автор *</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Имя автора"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Отмена</button>
                        <button type="submit" className="save-btn" style={{ backgroundColor: '#2ecc71' }}>Загрузить</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBookModal;