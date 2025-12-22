// components/ThemeSwitch.tsx
"use client";

import React, { useContext } from "react";
import { ThemeContext } from "context/ThemeContext";

const ThemeSwitch: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className={`theme-switch flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200
        ${theme === "light" ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-md hover:brightness-105" 
                              : "bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg hover:brightness-110"}`}
      aria-label="Toggle theme"
    >
      <span className="text-lg">
        {theme === "light" ? "☀️" : "🌙"}
      </span>
      <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
};

export default ThemeSwitch;
