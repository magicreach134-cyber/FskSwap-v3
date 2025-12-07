// src/pages/_app.jsx
import "../style/theme.css";
import "../style/swap-form.css";
import "../style/launchpad.css";
import "../style/flashswap.css";
import "../style/staking.css";
import "../style/token-select.css";

import AppRouter from "../app/router";

function MyApp({ Component, pageProps }) {
  // Component and pageProps are unused because AppRouter handles routing
  return <AppRouter />;
}

export default MyApp;
