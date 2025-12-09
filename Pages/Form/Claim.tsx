"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import useFarm from "../../hooks/useFarm";
import "../../styles/farm.css";

const FarmClaim = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(prov);
      const s = prov.getSigner();
      setSigner(s);
      s.getAddress().then(setUserAddress);
    }
  }, []);

  const { farms, claim } = useFarm(signer);

  const handleClaim = async (farmAddress: string) => {
    try {
      await claim(farmAddress);
      alert("Claimed rewards successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Claim failed: " + err.message);
    }
  };

  return (
    <div className="farm-page">
      <header className="farm-header">
        <div className="logo">
          <img src="/logo.png" alt="FSKSwap" />
          <span>Claim Farm Rewards</span>
        </div>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="farm-container">
        <h2>Your Claimable Rewards</h2>
        {farms.length === 0 && <p>No farms found.</p>}

        {farms.map((farm, idx) => {
          const claimable = signer ? ethers.utils.formatEther(farm.claimable?.[userAddress] || 0) : "0";
          return (
            <div key={idx} className="farm-card">
              <p>
                <strong>Pair:</strong> {farm.name} ({farm.symbol})
              </p>
              <p>
                <strong>Claimable:</strong> {claimable}
              </p>
              {parseFloat(claimable) > 0 && (
                <button onClick={() => handleClaim(farm.address)}>Claim</button>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default FarmClaim;
