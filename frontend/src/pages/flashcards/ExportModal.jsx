import { useState } from "react";
import "./ExportModal.css";

const ExportModal = ({ isOpen, onClose, text, isLoading }) => {
	const [copied, setCopied] = useState(false);

	if (!isOpen) return null;

	const handleCopy = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="export-modal-content"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="export-modal-header">
					<h3>Результат экспорта</h3>
					<button className="close-button" onClick={onClose}>
						&times;
					</button>
				</div>

				<div className="export-modal-body">
					{isLoading ? (
						<div className="export-loading">Загрузка данных с сервера...</div>
					) : (
						<textarea
							className="export-textarea"
							value={text}
							readOnly
							rows={12}
						/>
					)}
				</div>

				<div className="export-modal-footer">
					<button
						className="btn-copy"
						onClick={handleCopy}
						disabled={isLoading || !text}
					>
						{copied ? "✓ Скопировано!" : "📋 Скопировать текст"}
					</button>
					<button className="btn-close-modal" onClick={onClose}>
						Закрыть
					</button>
				</div>
			</div>
		</div>
	);
};

export default ExportModal;
