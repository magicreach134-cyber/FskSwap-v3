// src/context/ThemeContext.jsx
"use client";

import React, { createContext, useEffect, useState } from "react";

// If you already have a useTheme hook, this provider will still work with it.
// This Context exposes: { theme, toggleTheme, setTheme }
export const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const initial = stored || "light";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch (e) {
      // ignore storage errors in environments with no localStorage
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
