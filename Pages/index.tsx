"use client";

import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";

const Home = () => {
  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">FSKSwap Dashboard</h1>
        <div className="flex gap-4">
          <WalletConnectButton />
          <ThemeSwitch />
        </div>
      </header>
      <main>
        <p>Welcome to FSKSwap Testnet. Navigate using the menu to Swap, Launchpad, Staking, or FlashSwap.</p>
      </main>
    </div>
  );
};

export default Home;
