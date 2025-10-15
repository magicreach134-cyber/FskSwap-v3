"use client";
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition"
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
