"use client";

import { useEffect, useState } from "react";

const ThemeSwitch = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <button onClick={toggle} className="px-2 py-1 border rounded">
      {theme === "light" ? "Dark" : "Light"} Mode
    </button>
  );
};

export default ThemeSwitch;
