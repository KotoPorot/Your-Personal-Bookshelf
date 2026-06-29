import React, { useState } from 'react';
import axios from 'axios'; // Импортируем Axios для работы с сетью
import './Auth.css';

const Auth = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Для вывода ошибок на экран

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Сбрасываем старую ошибку перед новым запросом

    try {
      // Отправляем POST-запрос на твой Спринг-контроллер авторизации
      // ВАЖНО: Укажи тут тот URL эндпоинта, который прописан у тебя на бэкенде для логина!
      const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
        username: username,
        password: password
      });

      // Предположим, твой бэкенд возвращает токен в поле "token" (например: { token: "ey..." })
      // Если бэкенд возвращает просто строку токена, то это будет: const token = response.data;
      const token = response.data;

      if (token) {
        onLoginSuccess(token); // Передаем настоящий токен в App.jsx
      } else {
        setError('Сервер не вернул токен доступа.');
      }

    } catch (err) {
      // Если бэкенд вернул 401 Unauthorized, 403 или упал
      console.error('Ошибка авторизации:', err);
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Вход в Bookshelf</h2>

        {/* Если есть ошибка — красиво выводим её пользователю */}
        {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        <div className="input-group">
          <label>Логин</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-btn">Войти</button>
      </form>
    </div>
  );
};

export default Auth;