import React from 'react';

const Header = ({ onLogout }) => {
    return (
        <header className="bookshelf-header">
            <div className="header-logo">📚 Your Bookshelf</div>
            <div className="header-user">
                <span className="user-welcome">Привет, пользователь!</span>
                <button className="logout-button" onClick={onLogout}>Выйти</button>
            </div>
        </header>
    );
};

export default Header;