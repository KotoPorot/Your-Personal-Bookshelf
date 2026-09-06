import { useState, useEffect } from "react";
import { useTranslationSettings } from "../../../context/TranslationContext";
import "./styles/TranslatorSettingPanel.css";

const TranslatorSettingsPanel = () => {
  const {
    sourceLanguage,
    targetLanguage,
    availableLanguages,
    loadingLangs,
    saveSettings,
  } = useTranslationSettings();

  const [selectedSource, setSelectedSource] = useState(sourceLanguage);
  const [selectedTarget, setSelectedTarget] = useState(targetLanguage);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSelectedSource(sourceLanguage);
    setSelectedTarget(targetLanguage);
  }, [sourceLanguage, targetLanguage]);

  const handleSave = () => {
    saveSettings(selectedSource, selectedTarget);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const hasChanges =
    selectedSource !== sourceLanguage || selectedTarget !== targetLanguage;

  return (
    <div className="translator-settings-panel">
      <div className="translator-panel-header">
        <h4>🌐 Настройки перевода</h4>
      </div>

      <div className="translator-field">
        <label htmlFor="source-lang-select">Переводить с:</label>
        <select
          id="source-lang-select"
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          disabled={loadingLangs}
          className="translator-select"
        >
          <option value="AUTO">✨ Автоопределение</option>
          {availableLanguages.map((item) => (
            <option key={`src-${item.lang}`} value={item.lang}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="translator-field">
        <label htmlFor="target-lang-select">Переводить на:</label>
        <select
          id="target-lang-select"
          value={selectedTarget}
          onChange={(e) => setSelectedTarget(e.target.value)}
          disabled={loadingLangs}
          className="translator-select"
        >
          {availableLanguages.map((item) => (
            <option key={`tgt-${item.lang}`} value={item.lang}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="translator-actions">
        <button
          className={`translator-save-btn ${isSaved ? "saved" : ""}`}
          onClick={handleSave}
          disabled={!hasChanges && !isSaved}
        >
          {isSaved ? "✓ Сохранено" : "Сохранить"}
        </button>
      </div>
    </div>
  );
};

export default TranslatorSettingsPanel;
