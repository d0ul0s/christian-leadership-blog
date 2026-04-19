import React, { createContext, useContext, useEffect, useState } from 'react';

export const themes = [
  { id: 'ivory-scholar', name: 'The Ivory Scholar', mode: 'Light' },
  { id: 'midnight-servant', name: 'The Midnight Servant', mode: 'Dark' },
  { id: 'crimson-martyr', name: 'The Crimson Martyr', mode: 'Dark' },
  { id: 'ancient-abbey', name: 'The Ancient Abbey', mode: 'Dark' },
  { id: 'modern-minimalist', name: 'Modern Minimalist', mode: 'Light' }
];

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('themeId');
    if (savedTheme && themes.find(t => t.id === savedTheme)) return savedTheme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'midnight-servant';
    return 'ivory-scholar';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('themeId', theme);
  }, [theme]);

  // Keep toggleTheme for backwards compatibility with any missed buttons
  const toggleTheme = () => setTheme(prev => (prev === 'ivory-scholar' ? 'midnight-servant' : 'ivory-scholar'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
