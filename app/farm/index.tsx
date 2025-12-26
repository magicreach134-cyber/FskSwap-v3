"use client";

import { useState, useEffect } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { ethers, BigNumber } from "ethers";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import useFarm, { FarmView } from "../../hooks/useFarm";
import "../../styles/farm.css";

const FarmIndex = () => {
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");

  // Initialize wallet
  useEffect(() => {
    if (window.ethereum) {
      const prov = new Web3Provider(window.ethereum);
      setProvider(prov);
      const s = prov.getSigner();
      setSigner(s);
      s.getAddress().then(setUserAddress).catch(() => setUserAddress(""));
    }
  }, []);

  // Get farming pairs from useFarm hook
  const { farms, stake, unstake, claim, userStaked, claimableRewards } = useFarm(signer);

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

        {farms.map((farm: FarmView, idx: number) => (
          <div key={idx} className="farm-card">
            <p>
              <strong>Pair:</strong> {farm.name} ({farm.symbol})
            </p>
            <p>
              <strong>APY:</strong> {farm.apy}%
            </p>
            <p>
              <strong>Total Staked:</strong>{" "}
              {farm.totalStaked ? ethers.utils.formatUnits(farm.totalStaked, 18) : "0"}
            </p>
            <p>
              <strong>Your Staked:</strong>{" "}
              {signer && userAddress
                ? ethers.utils.formatUnits(userStaked(farm.address, userAddress) || BigNumber.from(0), 18)
                : "0"}
            </p>
            <p>
              <strong>Claimable Rewards:</strong>{" "}
              {signer && userAddress
                ? ethers.utils.formatUnits(claimableRewards(farm.address, userAddress) || BigNumber.from(0), 18)
                : "0"}
            </p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default FarmIndex;
