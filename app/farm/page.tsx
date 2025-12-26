"use client";

import { useWallet } from "@/hooks/useWallet";
import useFarm from "@/hooks/useFarm";
import { useState } from "react";

export default function FarmPage() {
  const { signer, account } = useWallet();
  const { farms, stake, unstake, claim } = useFarm(signer ?? null);

  // Track loading per farm
  const [loadingFarms, setLoadingFarms] = useState<Record<number, boolean>>({});

  const handleStake = async (pid: number) => {
    const input = prompt("Enter amount to stake:");
    if (!input || isNaN(Number(input)) || Number(input) <= 0) return;

    setLoadingFarms((prev) => ({ ...prev, [pid]: true }));
    try {
      await stake(pid, input);
    } catch (err) {
      console.error("Stake failed:", err);
    } finally {
      setLoadingFarms((prev) => ({ ...prev, [pid]: false }));
    }
  };

  const handleUnstake = async (pid: number) => {
    const input = prompt("Enter amount to unstake:");
    if (!input || isNaN(Number(input)) || Number(input) <= 0) return;

    setLoadingFarms((prev) => ({ ...prev, [pid]: true }));
    try {
      await unstake(pid, input);
    } catch (err) {
      console.error("Unstake failed:", err);
    } finally {
      setLoadingFarms((prev) => ({ ...prev, [pid]: false }));
    }
  };

  const handleClaim = async (pid: number) => {
    setLoadingFarms((prev) => ({ ...prev, [pid]: true }));
    try {
      await claim(pid);
    } catch (err) {
      console.error("Claim failed:", err);
    } finally {
      setLoadingFarms((prev) => ({ ...prev, [pid]: false }));
    }
  };

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Farming</h2>

      {!account && <p>Please connect your wallet to see farms.</p>}

      {account && farms.length === 0 && <p>No active farms yet.</p>}

      {account && farms.length > 0 && (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1">Farm</th>
              <th className="border px-2 py-1">Staked</th>
              <th className="border px-2 py-1">Pending</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {farms.map((farm) => (
              <tr key={farm.pid}>
                <td className="border px-2 py-1">{farm.name}</td>
                <td className="border px-2 py-1">{farm.staked}</td>
                <td className="border px-2 py-1">{farm.pending}</td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    disabled={!!loadingFarms[farm.pid]}
                    onClick={() => handleStake(farm.pid)}
                  >
                    Stake
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    disabled={!!loadingFarms[farm.pid]}
                    onClick={() => handleUnstake(farm.pid)}
                  >
                    Unstake
                  </button>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    disabled={!!loadingFarms[farm.pid]}
                    onClick={() => handleClaim(farm.pid)}
                  >
                    Claim
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
