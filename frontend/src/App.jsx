import React, { useState } from 'react';
import Auth from './pages/auth/Auth.jsx';
import Bookshelf from './pages/bookshelf/Bookshelf.jsx';
import WelcomePage from './pages/auth/Welcome-page.jsx';
import Register from './pages/auth/Register.jsx';
import ReaderPage from './pages/reader/ReaderPage.jsx'; // Не забудьте создать этот файл
import './App.css';

function App() {
  // 1. Состояния аутентификации
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Гость');

  // 2. Состояние навигации между экранами
  const [currentScreen, setCurrentScreen] = useState('welcome');

  // 3. Состояние для читалки (ID книги)
  const [activeBookId, setActiveBookId] = useState(null);

  const handleLoginSuccess = (receivedToken, username) => {
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);
    setUsername(username);
    localStorage.setItem('username', username);
    setCurrentScreen('bookshelf'); // Переход на полку после входа
  };

  const handleLogout = () => {
    setToken(null);
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
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
          onBack={() => setCurrentScreen('bookshelf')}
        />
      );
    }

    // В остальных случаях — показываем библиотеку
    return (
      <Bookshelf
        token={token}
        username={username}
        onLogout={handleLogout}
        onOpenReader={handleOpenReader} // Пробрасываем функцию для открытия книги
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