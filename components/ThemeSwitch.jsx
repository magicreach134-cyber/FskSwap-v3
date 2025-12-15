// components/ThemeSwitch.jsx
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      className={`theme-switch ${theme}`}
      onClick={toggleTheme}
      title="Toggle Light/Dark Mode"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default ThemeSwitch;
