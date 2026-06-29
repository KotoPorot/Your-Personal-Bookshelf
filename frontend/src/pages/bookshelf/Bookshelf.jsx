import React from 'react';
import './Bookshelf.css';

const Bookshelf = ({ token, onLogout }) => {
    return (
        <div className="bookshelf-container">
            <h1>Моя персональная книжная полка</h1>
            <p>Вы успешно вошли! Ваш токен: <code>{token}</code></p>

            {/* Кнопка для быстрой очистки localStorage и выхода */}
            <button onClick={onLogout} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
                Выйти из аккаунта
            </button>
        </div>
    );
};

export default Bookshelf;