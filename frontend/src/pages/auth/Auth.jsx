import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Auth = () => {
  const { login, setCurrentScreen } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "https://your-personal-bookshelf.onrender.com/api/v1/auth/login",
        {
          username: username,
          password: password,
        },
      );

      const token = response.data;

      if (token) {
        login(token, username);
      } else {
        setError("Сервер не вернул токен доступа.");
      }
    } catch (err) {
      console.error("Ошибка авторизации:", err);
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className="auth-wrapper">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Вход в Bookshelf</h2>

        {error && <div className="error-message">{error}</div>}

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

        <button type="submit" className="auth-btn">
          Войти
        </button>

        <div className="auth-links">
          <button
            type="button"
            onClick={() => setCurrentScreen("welcome")}
            className="link-btn"
          >
            Назад
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen("register")}
            className="link-btn"
          >
            Регистрация
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
