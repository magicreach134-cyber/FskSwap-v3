// app/farm/page.tsx
"use client";

import { useWallet } from "@/hooks/useWallet";
import useFarm from "@/hooks/useFarm";

export default function FarmPage() {
  const { signer, account } = useWallet();
  const { getPendingRewards } = useFarm(signer);

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold">Farming</h2>
      <p>Stake LP tokens and earn FSK rewards.</p>
    </main>
  );
}
