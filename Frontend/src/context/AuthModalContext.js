import React, { createContext, useContext, useState } from 'react';

const AuthModalContext = createContext();

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('signIn'); // 'signIn', 'createAccount', 'resetPassword'

  const openModal = (view = 'signIn') => {
    setCurrentView(view);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentView('signIn');
  };

  const switchView = (view) => {
    setCurrentView(view);
  };

  const value = {
    isOpen,
    currentView,
    openModal,
    closeModal,
    switchView
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};
