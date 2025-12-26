"use client";

import { useEffect, useState } from "react";
import { ethers, Signer } from "ethers";

import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm, { FarmView } from "@/hooks/useFarm";
import { useWallet } from "@/context/WalletContext";

import "@/styles/staking.css";

const FarmClaim = () => {
  const { signer, account } = useWallet();
  const { farms, claim } = useFarm(signer as Signer | null);
  const [loadingPid, setLoadingPid] = useState<number | null>(null);

  const handleClaim = async (pid: number) => {
    if (!signer) {
      alert("Connect wallet first");
      return;
    }

    setLoadingPid(pid);
    try {
      await claim(pid);
      alert("Claimed rewards successfully");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Claim failed");
    } finally {
      setLoadingPid(null);
    }
  };

  return (
    <div className="farm-page">
      <header className="farm-header">
        <div className="logo">
          <img src="/assets/logo.png" alt="FSKSwap" />
          <span>Claim Farm Rewards</span>
        </div>

        <div className="header-right">
          <WalletConnectButton />
          <ThemeSwitch />
        </div>
      </header>

      <main className="farm-container">
        <h2>Your Claimable Rewards</h2>

        {!signer && <p>Please connect your wallet to view farms.</p>}
        {signer && farms.length === 0 && <p>No farms available.</p>}

        {farms.map((farm: FarmView) => {
          // Parse pending reward safely
          const claimable = parseFloat(farm.pending || "0");

          return (
            <div key={farm.pid} className="farm-card">
              <p>
                <strong>Pair:</strong> {farm.name} ({farm.symbol})
              </p>
              <p>
                <strong>Claimable:</strong> {claimable.toFixed(6)}
              </p>

              {claimable > 0 && (
                <button
                  onClick={() => handleClaim(farm.pid)}
                  disabled={loadingPid === farm.pid}
                >
                  {loadingPid === farm.pid ? "Claiming..." : "Claim"}
                </button>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default FarmClaim;
