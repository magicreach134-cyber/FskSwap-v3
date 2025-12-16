// app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">FSKSwap Testnet</h1>

      <nav className="space-x-4">
        <Link href="/swap">Swap</Link>
        <Link href="/farm">Farm</Link>
        <Link href="/launchpad">Launchpad</Link>
        <Link href="/flashswap">FlashSwap</Link>
      </nav>
    </main>
  );
}
