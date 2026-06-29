import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

// onLoginSuccess придет из App.jsx, чтобы мы могли сразу залогинить пользователя
const Register = ({ onLoginSuccess, onNavigateToWelcome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Отправляем POST-запрос на твой эндпоинт регистрации
      const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
        username: username,
        password: password
      });

      // Бэкенд возвращает строку токена в response.data
      const token = response.data;

      if (token) {
        // Передаем токен в App.jsx.
        // Это автоматически сохранит его в localStorage и перенаправит на полку!
        onLoginSuccess(token);
      } else {
        setError('Сервер не вернул токен после регистрации.');
      }

    } catch (err) {
      console.error('Ошибка регистрации:', err);

      // Если бэкенд выбросил IllegalArgumentException, вернется статус 409 CONFLICT
      if (err.response && err.response.status === 409) {
        setError(err.response.data || 'Имя пользователя уже занято.');
      } else {
        setError('Не удалось подключиться к серверу.');
      }
    }
  };

  return (
    <div className="register-wrapper">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Регистрация в Bookshelf</h2>

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

        <button type="submit" className="register-btn-submit">Зарегистрироваться и войти</button>

        <div className="register-links" style={{ marginTop: '15px', textalign: 'center' }}>
          <button type="button" onClick={onNavigateToWelcome} className="link-btn">
            Назад на главную
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;