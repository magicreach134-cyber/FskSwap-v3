"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import useFarm, { FarmView } from "@/hooks/useFarm";
import ThemeSwitch from "@/components/ThemeSwitch";

import "@/styles/staking.css";

const StakingPage = () => {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { farms, stake, unstake, claim } = useFarm();

  const [amount, setAmount] = useState("");
  const [loadingPid, setLoadingPid] = useState<number | null>(null);

  const handleStake = async (pid: number) => {
    if (!walletClient) return alert("Connect wallet");
    setLoadingPid(pid);
    try {
      await stake(walletClient, pid, amount);
      setAmount("");
    } finally {
      setLoadingPid(null);
    }
  };

  const handleUnstake = async (pid: number) => {
    if (!walletClient) return alert("Connect wallet");
    setLoadingPid(pid);
    try {
      await unstake(walletClient, pid, amount);
      setAmount("");
    } finally {
      setLoadingPid(null);
    }
  };

  const handleClaim = async (pid: number) => {
    if (!walletClient) return alert("Connect wallet");
    setLoadingPid(pid);
    try {
      await claim(walletClient, pid);
    } finally {
      setLoadingPid(null);
    }
  };

  return (
    <div className="farm-page">
      <header className="farm-header">
        <h2>FSKSwap Staking</h2>
        <div className="header-right">
          <ConnectButton />
          <ThemeSwitch />
        </div>
      </header>

      {!isConnected && <p>Please connect your wallet.</p>}

      {isConnected &&
        farms.map((farm: FarmView) => (
          <div key={farm.pid} className="farm-card">
            <p>
              <strong>{farm.name}</strong> ({farm.symbol})
            </p>
            <p>Staked: {farm.staked}</p>
            <p>Pending Rewards: {farm.pending}</p>

            <input
              type="text"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="farm-actions">
              <button
                onClick={() => handleStake(farm.pid)}
                disabled={loadingPid === farm.pid}
              >
                Stake
              </button>

              <button
                onClick={() => handleUnstake(farm.pid)}
                disabled={loadingPid === farm.pid}
              >
                Unstake
              </button>

              <button
                onClick={() => handleClaim(farm.pid)}
                disabled={loadingPid === farm.pid}
              >
                Claim
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default StakingPage;
