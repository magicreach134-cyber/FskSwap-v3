"use client";

import WalletConnectButton from "../WalletConnectButton";
import ThemeSwitch from "../ThemeSwitch";

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="FSKSwap" className="w-10 h-10" />
        <span className="font-bold text-xl text-gray-900 dark:text-white">FSKSwap</span>
      </div>
      <div className="flex gap-4">
        <a href="/swap" className="hover:text-yellow-400">Swap</a>
        <a href="/launchpad" className="hover:text-yellow-400">Launchpad</a>
        <a href="/staking" className="hover:text-yellow-400">Staking</a>
        <a href="/flashswap" className="hover:text-yellow-400">FlashSwap</a>
        <WalletConnectButton />
        <ThemeSwitch />
      </div>
    </nav>
  );
};

export default Navbar;
