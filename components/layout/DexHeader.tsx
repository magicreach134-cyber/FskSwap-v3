"use client";

import WalletConnectButton from "../WalletConnectButton";
import ThemeSwitch from "../ThemeSwitch";

export default function DexHeader() {
  return (
    <header className="dex-header">
      <div className="dex-logo">
        <img
          src="/assets/logo.png"
          alt="FSKSwap Logo"
          width={40}
          height={40}
        />
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
  );
}
