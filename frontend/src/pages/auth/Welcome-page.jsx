import React from 'react';
import './Welcome-page.css';

const WelcomePage = ({ onNavigateToLogin, onNavigateToRegister }) => {
  return (
    <div className="welcome-wrapper">
      <div className="welcome-card">
        <h1>Добро пожаловать в Your Personal Bookshelf! 📚</h1>
        <p>Удобный трекер для организации ваших книг и книжных полок.</p>

        <div className="welcome-actions">
          {/* При клике переключаем экран на форму входа */}
          <button className="welcome-btn login-btn" onClick={onNavigateToLogin}>
            Войти
          </button>

          {/* Эту кнопку пока оставляем заглушкой, как ты просил */}
          <button className="welcome-btn register-btn" onClick={onNavigateToRegister}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;