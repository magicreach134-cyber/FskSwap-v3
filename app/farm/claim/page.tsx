"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm, { FarmView } from "@/hooks/useFarm";

import "@/styles/staking.css";

const FarmClaim = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const prov = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(prov);

      prov.getSigner().then((s) => {
        setSigner(s);
        s.getAddress().then(setUserAddress).catch(() => {});
      });
    }
  }, []);

  const { farms, claim } = useFarm(signer);

  const handleClaim = async (pid: number) => {
    try {
      await claim(pid);
      alert("Claimed rewards successfully");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Claim failed");
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
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="farm-container">
        <h2>Your Claimable Rewards</h2>

        {farms.length === 0 && <p>No farms available.</p>}

        {farms.map((farm: FarmView) => {
          const claimable = parseFloat(farm.pending);

          return (
            <div key={farm.pid} className="farm-card">
              <p>
                <strong>Pair:</strong> {farm.name} ({farm.symbol})
              </p>
              <p>
                <strong>Claimable:</strong> {farm.pending}
              </p>

              {claimable > 0 && (
                <button onClick={() => handleClaim(farm.pid)}>Claim</button>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default FarmClaim;
