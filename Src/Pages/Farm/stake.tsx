"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import useFarm from "../../hooks/useFarm";
import "../../styles/farm.css";

const FarmStake = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedFarm, setSelectedFarm] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(prov);
      const s = prov.getSigner();
      setSigner(s);
      s.getAddress().then(setUserAddress);
    }
  }, []);

  const { farms, stake } = useFarm(signer);

  const handleStake = async () => {
    if (!selectedFarm) return alert("Select a farm.");
    if (!amount || parseFloat(amount) <= 0) return alert("Enter a valid amount.");
    try {
      await stake(selectedFarm.address, ethers.utils.parseEther(amount));
      alert("Staked successfully!");
      setAmount("");
    } catch (err: any) {
      console.error(err);
      alert("Staking failed: " + err.message);
    }
  };

  return (
    <div className="farm-page">
      <header className="farm-header">
        <div className="logo">
          <img src="/logo.png" alt="FSKSwap" />
          <span>Stake LP Tokens</span>
        </div>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="farm-container">
        <h2>Stake LP Tokens</h2>

        <select onChange={(e) => setSelectedFarm(farms[e.target.value])} defaultValue="">
          <option value="" disabled>
            Select Farm
          </option>
          {farms.map((farm, idx) => (
            <option key={idx} value={idx}>
              {farm.name} ({farm.symbol})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount to stake"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button onClick={handleStake}>Stake</button>
      </main>
    </div>
  );
};

export default FarmStake;
