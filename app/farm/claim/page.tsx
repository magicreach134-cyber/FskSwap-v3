"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";

import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm, { FarmView } from "@/hooks/useFarm";

import "@/styles/staking.css";

const FarmClaim = () => {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");
  const { farms, loadingFarms, loadFarms, claim, stake, unstake } = useFarm(signer);
  const [loadingPid, setLoadingPid] = useState<number | null>(null);
  const [inputAmounts, setInputAmounts] = useState<Record<number, string>>({});

  /* ---------- WALLET INIT ---------- */
  useEffect(() => {
    if (!window.ethereum) return;

    (async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
        setAccount(await signer.getAddress());
      } catch (err) {
        console.error("Wallet initialization failed:", err);
      }
    })();
  }, []);

  /* ---------- LOAD FARMS ---------- */
  useEffect(() => {
    if (!signer || !account) return;
    loadFarms().catch(console.error);
  }, [signer, account, loadFarms]);

  /* ---------- HANDLE CLAIM ---------- */
  const handleClaim = async (pid: number) => {
    if (!signer) return alert("Connect wallet first");
    setLoadingPid(pid);
    try {
      await claim(pid);
      alert("Rewards claimed successfully");
    } catch (err: any) {
      alert(err?.message || "Claim failed");
    } finally {
      setLoadingPid(null);
    }
  };

  /* ---------- HANDLE STAKE ---------- */
  const handleStake = async (pid: number) => {
    const amount = inputAmounts[pid];
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount");
    setLoadingPid(pid);
    try {
      await stake(pid, amount);
      alert(`Staked ${amount} successfully`);
    } catch (err: any) {
      alert(err?.message || "Stake failed");
    } finally {
      setLoadingPid(null);
    }
  };

  /* ---------- HANDLE UNSTAKE ---------- */
  const handleUnstake = async (pid: number) => {
    const amount = inputAmounts[pid];
    if (!amount || Number(amount) <= 0) return alert("Enter a valid amount");
    setLoadingPid(pid);
    try {
      await unstake(pid, amount);
      alert(`Unstaked ${amount} successfully`);
    } catch (err: any) {
      alert(err?.message || "Unstake failed");
    } finally {
      setLoadingPid(null);
    }
  };

  return (
    <div className="farm-page">
      <header className="farm-header">
        <div className="logo">
          <img src="/assets/logo.png" alt="FSKSwap" />
          <span>Farms & Rewards</span>
        </div>

        <div className="header-right">
          <button
            onClick={async () => {
              if (!window.ethereum) return alert("No wallet found");
              const provider = new BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              setSigner(signer);
              setAccount(await signer.getAddress());
            }}
          >
            {account ? account.slice(0, 6) + "..." + account.slice(-4) : "Connect Wallet"}
          </button>
          <ThemeSwitch />
        </div>
      </header>

      <main className="farm-container">
        <h2>Your Farms</h2>

        {!account && <p>Please connect your wallet to view farms.</p>}
        {account && loadingFarms && <p>Loading farms...</p>}
        {account && !loadingFarms && farms.length === 0 && <p>No farms available.</p>}

        {account && farms.map((farm: FarmView) => {
          const claimable = Number(farm.pending ?? "0");
          const staked = Number(farm.staked ?? "0");

          return (
            <div key={farm.pid} className="farm-card">
              <h3>{farm.name} ({farm.symbol})</h3>
              <p><strong>Staked:</strong> {staked.toFixed(6)}</p>
              <p><strong>Claimable:</strong> {claimable.toFixed(6)} {farm.rewardTokenSymbol}</p>
              <p><strong>APY:</strong> {farm.apy.toFixed(2)}%</p>

              <div className="farm-actions">
                {claimable > 0 && (
                  <button
                    onClick={() => handleClaim(farm.pid)}
                    disabled={loadingPid === farm.pid}
                  >
                    {loadingPid === farm.pid ? "Claiming..." : `Claim ${farm.rewardTokenSymbol}`}
                  </button>
                )}

                <input
                  type="number"
                  placeholder="Amount"
                  min="0"
                  value={inputAmounts[farm.pid] || ""}
                  onChange={(e) => setInputAmounts({ ...inputAmounts, [farm.pid]: e.target.value })}
                />

                <button
                  onClick={() => handleStake(farm.pid)}
                  disabled={loadingPid === farm.pid}
                >
                  {loadingPid === farm.pid ? "Processing..." : "Stake"}
                </button>

                <button
                  onClick={() => handleUnstake(farm.pid)}
                  disabled={loadingPid === farm.pid}
                >
                  {loadingPid === farm.pid ? "Processing..." : "Unstake"}
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default FarmClaim;
