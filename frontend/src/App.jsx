import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BookProvider } from "./context/BookContext";
import { FolderProvider } from "./context/FolderContext.jsx";
import { FlashcardProvider } from "./context/FlashcardContext.jsx";
import Auth from "./pages/auth/Auth.jsx";
import Bookshelf from "./pages/bookshelf/Bookshelf.jsx";
import WelcomePage from "./pages/auth/Welcome-page.jsx";
import Register from "./pages/auth/Register.jsx";
import ReaderPage from "./pages/reader/ReaderPage.jsx";
import FlashcardPage from "./pages/flashcards/FlashcardsPage.jsx";
import "./App.css";

function MainApp() {
  const { token, currentScreen } = useAuth();

  if (token) {
    if (currentScreen === "reader") {
      return <ReaderPage />;
    }
    if (currentScreen === "flashcards") {
      return <FlashcardPage />;
    }
    if (currentScreen === "bookshelf") {
      return <Bookshelf />;
    }
    return <Bookshelf />;
  }

  return (
    <div className="app-container">
      {currentScreen === "welcome" && <WelcomePage />}
      {currentScreen === "login" && <Auth />}
      {currentScreen === "register" && <Register />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <FolderProvider>
          <FlashcardProvider>
            <MainApp />
          </FlashcardProvider>
        </FolderProvider>
      </BookProvider>
    </AuthProvider>
  );
}
