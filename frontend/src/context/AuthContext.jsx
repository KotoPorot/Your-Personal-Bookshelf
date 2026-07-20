import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Гость');
  const [currentScreen, setCurrentScreen] = useState(() => localStorage.getItem('currentScreen') || 'welcome');
  const [activeBook, setActiveBook] = useState(() => {
    const saved = localStorage.getItem('activeBook');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('currentScreen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    if (activeBook) {
      localStorage.setItem('activeBook', JSON.stringify(activeBook));
    } else {
      localStorage.removeItem('activeBook');
    }
  }, [activeBook]);

  const login = (receivedToken, user) => {
    setToken(receivedToken);
    localStorage.setItem('token', receivedToken);
    setUsername(user);
    localStorage.setItem('username', user);
    setCurrentScreen('bookshelf');
  };

  const logout = () => {
    setToken(null);
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setActiveBook(null);
    setCurrentScreen('welcome');
  };

  const openReader = (book) => {
    setActiveBook(book);
    setCurrentScreen('reader');
  };

  const closeReader = () => {
    setCurrentScreen('bookshelf');
    setActiveBook(null);
  };

  return (
    <AuthContext.Provider value={{
      token, username, currentScreen, activeBook,
      setCurrentScreen, login, logout, openReader, closeReader
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);