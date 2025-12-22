"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm from "@/hooks/useFarm";

import "@/styles/staking.css";

const FarmClaim = () => {
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const prov = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      setProvider(prov);

      const signerInstance = prov.getSigner();
      setSigner(signerInstance);

      signerInstance.getAddress().then(setUserAddress).catch(() => {});
    }
  }, []);

  const { farms, claim } = useFarm(signer);

  const handleClaim = async (farmAddress: string) => {
    try {
      await claim(farmAddress);
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

        {farms.map((farm, idx) => {
          const claimable = signer
            ? ethers.utils.formatEther(
                farm.claimable?.[userAddress] ?? "0"
              )
            : "0";

          return (
            <div key={idx} className="farm-card">
              <p>
                <strong>Pair:</strong> {farm.name} ({farm.symbol})
              </p>
              <p>
                <strong>Claimable:</strong> {claimable}
              </p>

              {parseFloat(claimable) > 0 && (
                <button onClick={() => handleClaim(farm.address)}>
                  Claim
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
