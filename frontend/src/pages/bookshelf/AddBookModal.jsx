import React, { useState } from "react";
import axios from "axios";

const AddBookModal = ({ activeShelfId, onClose, onUpload, token }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Пожалуйста, выберите файл EPUB!");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Отправляем файл на бэкенд
      const response = await axios.post(
        `https://your-personal-bookshelf.onrender.com/api/v1/books/addBook/${activeShelfId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type браузер установит сам (multipart/form-data)
          },
        },
      );

      // Получаем объект книги с заполненными метаданными (id, title, author, coverImageUrl)
      onUpload(response.data);
      onClose();
    } catch (err) {
      console.error("Ошибка при загрузке:", err);
      alert(
        "Не удалось загрузить книгу. Проверьте формат файла (должен быть EPUB).",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Загрузка книги</h3>
          <button className="close-modal-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="file-upload-zone">
            <label className="file-label">
              <span className="upload-icon">📁</span>
              <span className="upload-text">
                {selectedFile ? selectedFile.name : "Выберите файл .epub"}
              </span>
              <input
                type="file"
                accept=".epub"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isUploading || !selectedFile}
              style={{ backgroundColor: isUploading ? "#ccc" : "#2ecc71" }}
            >
              {isUploading ? "Парсинг и загрузка..." : "Загрузить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
