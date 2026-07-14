import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Укажи правильный путь к контексту
import './Register.css';

const Register = () => {
  const { login, setCurrentScreen } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
        username: username,
        password: password
      });

      const token = response.data;

      if (token) {
        // Сразу логиним пользователя после успешной регистрации
        login(token, username);
      } else {
        setError('Сервер не вернул токен после регистрации.');
      }

    } catch (err) {
      console.error('Ошибка регистрации:', err);

      if (err.response?.status === 409) {
        const backendMessage = typeof err.response.data === 'object'
          ? err.response.data.message
          : err.response.data;

        setError(backendMessage || 'Имя пользователя уже занято.');
      } else if (err.request) {
        setError('Сервер не отвечает. Попробуйте позже.');
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

        <div className="register-links" style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button type="button" onClick={() => setCurrentScreen('welcome')} className="link-btn">
            Назад на главную
          </button>
          <button type="button" onClick={() => setCurrentScreen('login')} className="link-btn">
            Уже есть аккаунт?
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;