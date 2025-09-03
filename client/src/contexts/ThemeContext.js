import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('blue');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('medemo_theme');
    const savedAccentColor = localStorage.getItem('medemo_accent_color');
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    
    // Save theme to localStorage
    localStorage.setItem('medemo_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Save accent color to localStorage
    localStorage.setItem('medemo_accent_color', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setAccent = (color) => {
    setAccentColor(color);
  };

  const value = {
    theme,
    accentColor,
    toggleTheme,
    setAccent,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
