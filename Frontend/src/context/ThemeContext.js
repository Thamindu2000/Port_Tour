import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect system preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    let prefersDark = false;

    if (savedTheme) {
      // Use saved preference
      prefersDark = savedTheme === 'dark';
    } else {
      // Default to light mode
      prefersDark = false;
    }

    setIsDarkMode(prefersDark);
    applyTheme(prefersDark);
  }, []);

  const applyTheme = (dark) => {
    const root = document.documentElement;
    const body = document.body;

    if (dark) {
      root.classList.add('dark');
      root.classList.remove('light');
      body.setAttribute('data-bs-theme', 'dark');
      
      // Dark mode CSS variables
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--bg-tertiary', '#3a3a3a');
      root.style.setProperty('--text-primary', '#f8f9fa');
      root.style.setProperty('--text-secondary', '#d0d0d0');
      root.style.setProperty('--text-muted', '#a0a0a0');
      
      body.style.backgroundColor = '#1a1a1a';
      body.style.color = '#f8f9fa';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body.setAttribute('data-bs-theme', 'light');
      
      // Light mode CSS variables
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-muted', '#64748b');
      
      body.style.backgroundColor = '#f8fafc';
      body.style.color = '#0f172a';
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    // Add transition class for smooth animation
    document.body.classList.add('theme-transition');
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    // Apply theme after a tick to allow transition class to be added
    setTimeout(() => {
      applyTheme(newTheme);
      // Remove transition class after transition completes
      setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 500);
    }, 0);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
