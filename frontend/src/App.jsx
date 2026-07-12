import React, { useState, useEffect } from 'react'; // Добавили useEffect
import Auth from './pages/auth/Auth.jsx';
import Bookshelf from './pages/bookshelf/Bookshelf.jsx';
import WelcomePage from './pages/auth/Welcome-page.jsx';
import Register from './pages/auth/Register.jsx';
import ReaderPage from './pages/reader/ReaderPage.jsx';
import './App.css';

function App() {
  // 1. Состояния аутентификации
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Гость');

  // 2. Состояние навигации с восстановлением после перезагрузки
  const [currentScreen, setCurrentScreen] = useState(() => {
    return localStorage.getItem('currentScreen') || 'welcome';
  });

  // 3. Состояние для читалки с восстановлением после перезагрузки
  const [activeBookId, setActiveBookId] = useState(() => {
    return localStorage.getItem('activeBookId') || null;
  });

  // ==========================================
  // АВТОМАТИЧЕСКОЕ СОХРАНЕНИЕ СОСТОЯНИЯ В LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    localStorage.setItem('currentScreen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    if (activeBookId) {
      localStorage.setItem('activeBookId', activeBookId);
    } else {
      localStorage.removeItem('activeBookId');
    }
  }, [activeBookId]);
  // ==========================================

  const handleLoginSuccess = (receivedToken, username) => {
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);
    setUsername(username);
    localStorage.setItem('username', username);
    setCurrentScreen('bookshelf');
  };

  const handleLogout = () => {
    setToken(null);
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setActiveBookId(null); // Сбрасываем книгу при выходе
    setCurrentScreen('welcome');
  };

  // Функция для открытия читалки
  const handleOpenReader = (bookId) => {
    setActiveBookId(bookId);
    setCurrentScreen('reader');
  };

  // --- ЛОГИКА ОТОБРАЖЕНИЯ ЭКРАНОВ ---

  // 1. Если пользователь авторизован
  if (token) {
    // Если активен экран читалки — показываем её
    if (currentScreen === 'reader') {
      return (
        <ReaderPage
          bookId={activeBookId}
          onBack={() => {
            setCurrentScreen('bookshelf');
            setActiveBookId(null); // Очищаем ID книги при возврате на полку
          }}
        />
      );
    }

    // В остальных случаях — показываем библиотеку
    return (
      <Bookshelf
        token={token}
        username={username}
        onLogout={handleLogout}
        onOpenReader={handleOpenReader}
      />
    );
  }

  // 2. Если НЕ авторизован — показываем экраны авторизации
  return (
    <div className="app-container">
      {currentScreen === 'welcome' && (
        <WelcomePage
          onNavigateToLogin={() => setCurrentScreen('login')}
          onNavigateToRegister={() => setCurrentScreen('register')}
        />
      )}

      {currentScreen === 'login' && (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}

      {currentScreen === 'register' && (
        <Register
          onLoginSuccess={handleLoginSuccess}
          onNavigateToWelcome={() => setCurrentScreen('welcome')}
        />
      )}
    </div>
  );
}

export default App;