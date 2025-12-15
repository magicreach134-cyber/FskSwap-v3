"use client";

import React from "react";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import "../style/theme.css"; // global theme styles
import "../style/swap-form.css";
import "../style/launchpad.css";
import "../style/flashswap.css";
import "../style/staking.css";

export const metadata = {
  title: "FSKSwap",
  description: "FSKSwap Dex - Swap, Launchpad, FlashSwap, and Staking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Header */}
        <header className="dex-header">
          <div className="dex-logo">
            <img src="/assets/logo.png" alt="FSKSwap Logo" width={40} height={40} />
            <span>FSKSwap</span>
          </div>

          <nav className="dex-nav">
            <a href="/">Swap</a>
            <a href="/launchpad">Launchpad</a>
            <a href="/staking">Staking</a>
            <a href="/flashswap">FlashSwap</a>
          </nav>

          <div className="dex-header-right">
            <WalletConnectButton />
            <ThemeSwitch />
          </div>
        </header>

        {/* Main content */}
        <main className="dex-main">{children}</main>

        {/* Footer */}
        <footer className="dex-footer">
          <p>© {new Date().getFullYear()} FSKSwap. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
