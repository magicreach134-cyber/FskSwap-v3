"use client";

import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mounted, setMounted] = useState(false);

  /**
   * Prevent hydration mismatch between server and client
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      type="button"
      className={`theme-switch ${theme}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle Light/Dark Mode"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default ThemeSwitch;
