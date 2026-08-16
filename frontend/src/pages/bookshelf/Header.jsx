import React from "react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ username, onLogout }) => {
  const { setCurrentScreen } = useAuth();
  return (
    <header className="bookshelf-header">
      <div
        className="header-logo"
        onClick={() => setCurrentScreen("bookshelf")}
        style={{ cursor: "pointer" }}
      >
        📚 Your Bookshelf
      </div>
      <div className="header-user">
        <span className="user-welcome">Привет, {username || "Гость"}!</span>
        <button className="logout-button" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </header>
  );
};

export default Header;
