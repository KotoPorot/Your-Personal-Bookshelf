import React, { useState } from 'react';
import Auth from './pages/auth/Auth.jsx';
import Bookshelf from './pages/bookshelf/Bookshelf.jsx';
import WelcomePage from './pages/auth/Welcome-page.jsx';
import Register from './pages/auth/Register.jsx';
import './App.css';

function App() {
  // 1. Проверяем токен в localStorage
  const [token, setToken] = useState(localStorage.getItem('token')||null);
  const [username, setUsername] = useState(localStorage.getItem('username')||'Гость');

  // 2. Новое состояние для навигации между экранами 'welcome' или 'login'
  const [currentScreen, setCurrentScreen] = useState('welcome');

  const handleLoginSuccess = (receivedToken, username) => {
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);
    setUsername(username);
    localStorage.setItem('username', username);
  };

  const handleLogout = () => {
    setToken(null);
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setCurrentScreen('welcome'); // После выхода возвращаем на приветственную страницу
  };

  // ЕСЛИ ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН — сразу пускаем в приложение
  if (token) {
    return <Bookshelf token={token} username={username} onLogout={handleLogout} />;
  }

  // ЕСЛИ НЕ АВТОРИЗОВАН — смотрим, на какой кнопке он находится
  return (
      <div className="app-container">
        {/* Если экран welcome — показываем приветствие и кнопки входа/регистрации */}
        {currentScreen === 'welcome' && (
          <WelcomePage
            onNavigateToLogin={() => setCurrentScreen('login')}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        )}

        {/* Если экран login — показываем форму авторизации */}
        {currentScreen === 'login' && (
          <Auth onLoginSuccess={handleLoginSuccess} />
        )}

        {/* Если экран register — показываем форму регистрации */}
        {currentScreen === 'register' && (
          <Register
            onLoginSuccess={handleLoginSuccess} // Передаем ту же функцию, чтобы сразу авторизовать юзера
            onNavigateToWelcome={() => setCurrentScreen('welcome')}
          />
        )}
      </div>
    );
  }

  export default App;