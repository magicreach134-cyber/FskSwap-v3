"use client";

import { useWallet } from "@/hooks/useWallet";
import useFarm from "@/hooks/useFarm";
import { useEffect, useState } from "react";
import Input from "@/components/forms/Input";

type LoadingState = {
  stake: boolean;
  unstake: boolean;
  claim: boolean;
};

type AmountMap = Record<number, { stake: string; unstake: string }>;

export default function FarmPage() {
  const { signer, account } = useWallet();
  const { farms, stake, unstake, claim } = useFarm(signer);

  const [loadingMap, setLoadingMap] = useState<Record<number, LoadingState>>({});
  const [amountMap, setAmountMap] = useState<AmountMap>({});

  // Initialize maps when farms update
  useEffect(() => {
    setLoadingMap((prev) => {
      const next: Record<number, LoadingState> = {};
      farms.forEach((farm) => {
        next[farm.pid] = prev[farm.pid] ?? { stake: false, unstake: false, claim: false };
      });
      return next;
    });

    setAmountMap((prev) => {
      const next: AmountMap = {};
      farms.forEach((farm) => {
        next[farm.pid] = prev[farm.pid] ?? { stake: "", unstake: "" };
      });
      return next;
    });
  }, [farms]);

  const handleAction = async (pid: number, action: "stake" | "unstake" | "claim") => {
    let amount: string | undefined;
    if (action === "stake") amount = amountMap[pid]?.stake;
    if (action === "unstake") amount = amountMap[pid]?.unstake;

    if ((action === "stake" || action === "unstake") && (!amount || Number(amount) <= 0)) {
      alert(`Enter a valid amount to ${action}`);
      return;
    }

    setLoadingMap((prev) => ({
      ...prev,
      [pid]: { ...prev[pid], [action]: true },
    }));

    try {
      if (action === "stake") await stake(pid, amount!);
      if (action === "unstake") await unstake(pid, amount!);
      if (action === "claim") await claim(pid);

      // Reset input on successful action
      setAmountMap((prev) => ({
        ...prev,
        [pid]: {
          ...prev[pid],
          stake: action === "stake" ? "" : prev[pid].stake,
          unstake: action === "unstake" ? "" : prev[pid].unstake,
        },
      }));
    } catch (err) {
      console.error(`${action} failed for pid ${pid}:`, err);
      alert(`${action} failed: ${err?.message || err}`);
    } finally {
      setLoadingMap((prev) => ({
        ...prev,
        [pid]: { ...prev[pid], [action]: false },
      }));
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
                <td className="border px-2 py-1 space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Stake amount"
                      value={amountMap[farm.pid]?.stake}
                      onChange={(e) =>
                        setAmountMap((prev) => ({
                          ...prev,
                          [farm.pid]: { ...prev[farm.pid], stake: e.target.value },
                        }))
                      }
                    />
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      disabled={loadingMap[farm.pid]?.stake}
                      onClick={() => handleAction(farm.pid, "stake")}
                    >
                      {loadingMap[farm.pid]?.stake ? "Staking..." : "Stake"}
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Unstake amount"
                      value={amountMap[farm.pid]?.unstake}
                      onChange={(e) =>
                        setAmountMap((prev) => ({
                          ...prev,
                          [farm.pid]: { ...prev[farm.pid], unstake: e.target.value },
                        }))
                      }
                    />
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      disabled={loadingMap[farm.pid]?.unstake}
                      onClick={() => handleAction(farm.pid, "unstake")}
                    >
                      {loadingMap[farm.pid]?.unstake ? "Unstaking..." : "Unstake"}
                    </button>
                  </div>

                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded w-full"
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
