"use client";

import { useWallet } from "@/hooks/useWallet";
import useFarm, { FarmView } from "@/hooks/useFarm";
import { useEffect, useState } from "react";

export default function FarmPage() {
  const { signer, account } = useWallet();
  const { farms, stake, unstake, claim, reloadFarms } = useFarm(signer); // add reloadFarms
  const [loadingMap, setLoadingMap] = useState<Record<number, { stake: boolean; unstake: boolean; claim: boolean }>>({});

  useEffect(() => {
    const map: Record<number, { stake: boolean; unstake: boolean; claim: boolean }> = {};
    farms.forEach((farm) => {
      if (!loadingMap[farm.pid]) {
        map[farm.pid] = { stake: false, unstake: false, claim: false };
      } else {
        map[farm.pid] = loadingMap[farm.pid];
      }
    });
    setLoadingMap(map);
  }, [farms]);

  const handleAction = async (
    pid: number,
    action: "stake" | "unstake" | "claim",
    promptAmount?: boolean
  ) => {
    let amount: string | undefined;
    if (promptAmount) {
      amount = prompt(`Enter amount to ${action}:`);
      if (!amount) return;
    }

    setLoadingMap((prev) => ({ ...prev, [pid]: { ...prev[pid], [action]: true } }));

    try {
      if (action === "stake") await stake(pid, amount!);
      if (action === "unstake") await unstake(pid, amount!);
      if (action === "claim") await claim(pid);

      // instant refresh of farm balances
      if (reloadFarms) await reloadFarms();
    } catch (err) {
      console.error(`${action} failed for pid ${pid}:`, err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [pid]: { ...prev[pid], [action]: false } }));
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
                    disabled={loadingMap[farm.pid]?.stake}
                    onClick={() => handleAction(farm.pid, "stake", true)}
                  >
                    {loadingMap[farm.pid]?.stake ? "Staking..." : "Stake"}
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    disabled={loadingMap[farm.pid]?.unstake}
                    onClick={() => handleAction(farm.pid, "unstake", true)}
                  >
                    {loadingMap[farm.pid]?.unstake ? "Unstaking..." : "Unstake"}
                  </button>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    disabled={loadingMap[farm.pid]?.claim}
                    onClick={() => handleAction(farm.pid, "claim")}
                  >
                    {loadingMap[farm.pid]?.claim ? "Claiming..." : "Claim"}
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
