"use client";

import { useEffect, useState, useCallback } from "react";
import { JsonRpcSigner, BrowserProvider, parseUnits, formatUnits } from "ethers";
import { useAccount } from "wagmi";

import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm, { FarmView } from "@/hooks/useFarm";

import "@/styles/staking.css";

const FarmDashboard = () => {
  const { address, isConnected } = useAccount();
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [loadingPid, setLoadingPid] = useState<number | null>(null);
  const [loadingFarms, setLoadingFarms] = useState(false);

  // Hook to manage farms
  const { farms, stake, unstake, claim, loadFarms } = useFarm(signer);

  /* ---------- WALLET CONNECT ---------- */
  const initWallet = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
    } catch (err) {
      console.error("Wallet init failed:", err);
    }
  }, []);

  useEffect(() => {
    if (isConnected) initWallet();
  }, [isConnected, initWallet]);

  /* ---------- LOAD FARMS ---------- */
  const refreshFarms = useCallback(async () => {
    if (!signer || !address) return;
    setLoadingFarms(true);
    try {
      await loadFarms();
    } catch (err) {
      console.error("Farm loading failed:", err);
    } finally {
      setLoadingFarms(false);
    }
  }, [signer, address, loadFarms]);

  useEffect(() => {
    refreshFarms();
    const interval = setInterval(refreshFarms, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [refreshFarms]);

  /* ---------- ACTION HANDLERS ---------- */
  const handleClaim = async (farm: FarmView) => {
    setLoadingPid(farm.pid);
    try {
      await claim(farm.pid);
      alert(`Claimed ${farm.pending} ${farm.symbol}`);
      await refreshFarms();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Claim failed");
    } finally {
      setLoadingPid(null);
    }
  };

  const handleStake = async (farm: FarmView) => {
    const amount = prompt(`Enter amount of ${farm.symbol} to stake:`);
    if (!amount) return;

    setLoadingPid(farm.pid);
    try {
      await stake(farm.pid, amount);
      alert(`Staked ${amount} ${farm.symbol} successfully`);
      await refreshFarms();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Stake failed");
    } finally {
      setLoadingPid(null);
    }
  };

  const handleUnstake = async (farm: FarmView) => {
    const amount = prompt(`Enter amount of ${farm.symbol} to unstake:`);
    if (!amount) return;

    setLoadingPid(farm.pid);
    try {
      await unstake(farm.pid, amount);
      alert(`Unstaked ${amount} ${farm.symbol} successfully`);
      await refreshFarms();
    } catch (err: any) {
      console.error(err);
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
          <span>FSKSwap Farms</span>
        </div>

        <div className="header-right">
          <button onClick={initWallet} className="wallet-btn">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
          </button>
          <ThemeSwitch />
        </div>
      </header>

      <main className="farm-container">
        <h2>Your Farms</h2>

        {!isConnected && <p>Please connect your wallet to view farms.</p>}
        {isConnected && loadingFarms && <p>Loading farms...</p>}
        {isConnected && !loadingFarms && farms.length === 0 && <p>No farms available.</p>}

        {isConnected && farms.length > 0 && (
          <div className="farm-grid">
            {farms.map((farm) => {
              const staked = Number(farm.staked ?? "0");
              const claimable = Number(farm.pending ?? "0");

              return (
                <div key={farm.pid} className="farm-card">
                  <p><strong>Pair:</strong> {farm.name} ({farm.symbol})</p>
                  <p><strong>Staked:</strong> {staked.toFixed(6)}</p>
                  <p><strong>Claimable:</strong> {claimable.toFixed(6)}</p>
                  {/* Placeholder APR / TVL */}
                  <p><strong>APR:</strong> ~12%</p>
                  <p><strong>TVL:</strong> 1000 FSK</p>

                  <div className="farm-actions">
                    <button
                      onClick={() => handleStake(farm)}
                      disabled={loadingPid === farm.pid}
                    >
                      {loadingPid === farm.pid ? "Processing..." : "Stake"}
                    </button>
                    <button
                      onClick={() => handleUnstake(farm)}
                      disabled={loadingPid === farm.pid || staked === 0}
                    >
                      {loadingPid === farm.pid ? "Processing..." : "Unstake"}
                    </button>
                    <button
                      onClick={() => handleClaim(farm)}
                      disabled={loadingPid === farm.pid || claimable === 0}
                    >
                      {loadingPid === farm.pid ? "Processing..." : "Claim"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmDashboard;
