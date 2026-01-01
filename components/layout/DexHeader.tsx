"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import ThemeSwitch from "../ThemeSwitch";

export default function DexHeader() {
  return (
    <header className="dex-header">
      <div className="dex-logo">
        <Link href="/" className="dex-logo-link">
          <Image
            src="/assets/logo.png"
            alt="FSKSwap Logo"
            width={40}
            height={40}
            priority
          />
          <span>FSKSwap</span>
        </Link>
      </div>

      <nav className="dex-nav">
        <Link href="/">Swap</Link>
        <Link href="/launchpad">Launchpad</Link>
        <Link href="/staking">Staking</Link>
        <Link href="/flashswap">FlashSwap</Link>
      </nav>

      <div className="dex-header-right">
        <ConnectButton
          chainStatus="icon"
          showBalance={false}
          accountStatus="address"
        />
        <ThemeSwitch />
      </div>
    </header>
  );
}
