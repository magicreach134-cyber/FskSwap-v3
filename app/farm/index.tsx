"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import useFarm from "../../hooks/useFarm";
import "../../styles/farm.css";

const FarmIndex = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState("");

  // Initialize wallet
  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(prov);
      const s = prov.getSigner();
      setSigner(s);
      s.getAddress().then(setUserAddress);
    }
  }, []);

  // Get farming pairs from useFarm hook
  const { farms, getUserStaked, getClaimableRewards } = useFarm(signer);

  return (
    <div className="farm-page">
      <header className="farm-header">
        <div className="logo">
          <img src="/logo.png" alt="FSKSwap" />
          <span>FSKSwap Farms</span>
        </div>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="farm-container">
        <h2>Available Farms</h2>
        {farms.length === 0 && <p>No farms available.</p>}

        {farms.map((farm, idx) => (
          <div key={idx} className="farm-card">
            <p>
              <strong>Pair:</strong> {farm.name} ({farm.symbol})
            </p>
            <p>
              <strong>APY:</strong> {farm.apy}%
            </p>
            <p>
              <strong>Total Staked:</strong> {ethers.utils.formatEther(farm.totalStaked)}
            </p>
            <p>
              <strong>Your Staked:</strong>{" "}
              {signer ? ethers.utils.formatEther(getUserStaked(farm.address, userAddress)) : "0"}
            </p>
            <p>
              <strong>Claimable Rewards:</strong>{" "}
              {signer ? ethers.utils.formatEther(getClaimableRewards(farm.address, userAddress)) : "0"}
            </p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default FarmIndex;
