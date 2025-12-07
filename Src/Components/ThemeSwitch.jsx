// src/components/ThemeSwitch.jsx
"use client";

import { useTheme } from "../context/ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "6px 10px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        background: theme === "light" ? "#fff" : "#222",
        color: theme === "light" ? "#000" : "#fff",
        cursor: "pointer",
      }}
    >
      {theme === "light" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
};

export default ThemeSwitch;
