import React from 'react';
import { useAuth } from '../../context/AuthContext'; // Укажи правильный путь к контексту
import './Welcome-page.css';

const WelcomePage = () => {
  const { setCurrentScreen } = useAuth();

  return (
    <div className="welcome-wrapper">
      <div className="welcome-card">
        <h1>Добро пожаловать в Your Personal Bookshelf! 📚</h1>
        <p>Удобный трекер для организации ваших книг и книжных полок.</p>

        <div className="welcome-actions">
          <button className="welcome-btn login-btn" onClick={() => setCurrentScreen('login')}>
            Войти
          </button>

          <button className="welcome-btn register-btn" onClick={() => setCurrentScreen('register')}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;