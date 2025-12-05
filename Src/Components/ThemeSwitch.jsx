import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default ThemeSwitch;
