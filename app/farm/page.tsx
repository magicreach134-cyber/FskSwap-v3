"use client";

import { useWallet } from "@/hooks/useWallet";
import useFarm from "@/hooks/useFarm";
import { useEffect, useState } from "react";

export default function FarmPage() {
  const { signer, account } = useWallet();
  const { farms, stake, unstake, claim } = useFarm(signer);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // farms auto-refresh inside useFarm hook
  }, [farms]);

  const handleStake = async (pid: number) => {
    const amount = prompt("Enter amount to stake:");
    if (!amount) return;
    setLoading(true);
    try {
      await stake(pid, amount);
    } catch (err) {
      console.error("Stake failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async (pid: number) => {
    const amount = prompt("Enter amount to unstake:");
    if (!amount) return;
    setLoading(true);
    try {
      await unstake(pid, amount);
    } catch (err) {
      console.error("Unstake failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (pid: number) => {
    setLoading(true);
    try {
      await claim(pid);
    } catch (err) {
      console.error("Claim failed:", err);
    } finally {
      setLoading(false);
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
                    disabled={loading}
                    onClick={() => handleStake(farm.pid)}
                  >
                    Stake
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    disabled={loading}
                    onClick={() => handleUnstake(farm.pid)}
                  >
                    Unstake
                  </button>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    disabled={loading}
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
