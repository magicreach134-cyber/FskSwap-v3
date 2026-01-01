"use client";

import { useState } from "react";
import useFarm, { FarmView } from "@/hooks/useFarm";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";

export default function FarmActions() {
  const { farms, stake, unstake, claim } = useFarm();

  const [pid, setPid] = useState<number>(0);
  const [amount, setAmount] = useState<string>("");

  const selectedFarm: FarmView | undefined = farms.find(
    (f) => f.pid === pid
  );

  return (
    <div className="space-y-4 max-w-md">
      {/* FARM SELECT */}
      <Select
        label="Select Farm"
        value={pid}
        onChange={(e) => setPid(Number(e.target.value))}
        options={farms.map((f) => ({
          value: f.pid,
          label: `${f.name} (${f.symbol})`,
        }))}
      />

      {/* STATS */}
      {selectedFarm && (
        <div className="text-sm space-y-1">
          <div>Staked: {selectedFarm.staked}</div>
          <div>Pending Reward: {selectedFarm.pending}</div>
        </div>
      )}

      {/* AMOUNT */}
      <Input
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.0"
      />

      {/* ACTIONS */}
      <div className="grid grid-cols-3 gap-2">
        <button
          className="btn-primary"
          onClick={() => stake(pid, amount)}
          disabled={!amount}
        >
          Stake
        </button>

        <button
          className="btn-secondary"
          onClick={() => unstake(pid, amount)}
          disabled={!amount}
        >
          Unstake
        </button>

        <button
          className="btn-accent"
          onClick={() => claim(pid)}
        >
          Claim
        </button>
      </div>
    </div>
  );
}
