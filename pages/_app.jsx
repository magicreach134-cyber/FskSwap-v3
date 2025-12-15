import "../style/theme.css";
import "../style/swap-form.css";
import "../style/launchpad.css";
import "../style/flashswap.css";
import "../style/staking.css";
import "../style/token-select.css";

import AppRouter from "../app/router";
import { ThemeProvider } from "../context/ThemeContext";

function MyApp({ Component, pageProps }) {
  // Wrap the entire app with ThemeProvider
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default MyApp;
