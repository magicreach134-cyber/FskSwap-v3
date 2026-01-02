"use client";

import { useEffect, useState } from "react";

const ThemeSwitch = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(!dark);
  };

  return (
    <button onClick={toggleTheme} className="theme-switch">
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
};

export default ThemeSwitch;
