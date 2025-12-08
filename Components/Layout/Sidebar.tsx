"use client";

const Sidebar = () => {
  return (
    <aside className="bg-gray-50 dark:bg-gray-800 p-4 w-64 min-h-screen">
      <ul className="flex flex-col gap-2">
        <li><a href="/swap" className="hover:text-yellow-400">Swap</a></li>
        <li><a href="/launchpad" className="hover:text-yellow-400">Launchpad</a></li>
        <li><a href="/staking" className="hover:text-yellow-400">Staking</a></li>
        <li><a href="/flashswap" className="hover:text-yellow-400">FlashSwap</a></li>
        <li><a href="/wallet" className="hover:text-yellow-400">Wallet</a></li>
        <li><a href="/profile" className="hover:text-yellow-400">Profile</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
