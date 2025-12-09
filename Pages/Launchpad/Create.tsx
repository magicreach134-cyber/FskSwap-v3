"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI } from "../../utils/constants";
import "../../styles/launchpad.css";

const CreatePresale = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState("");

  const [tokenAddress, setTokenAddress] = useState("");
  const [softCap, setSoftCap] = useState("");
  const [hardCap, setHardCap] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setUserAddress);
    }
  }, []);

  const handleCreatePresale = async () => {
    if (!tokenAddress || !softCap || !hardCap || !startTime || !endTime) {
      return alert("Please fill in all fields");
    }

    if (!signer) return alert("Connect your wallet first");

    try {
      setLoading(true);
      const factory = new ethers.Contract(
        launchpadFactoryAddress,
        FSKLaunchpadFactoryABI,
        signer
      );

      // Convert caps to wei
      const softCapWei = ethers.utils.parseEther(softCap);
      const hardCapWei = ethers.utils.parseEther(hardCap);

      // Convert start/end time to unix timestamp
      const startTimestamp = Math.floor(new Date(startTime).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endTime).getTime() / 1000);

      const tx = await factory.createPresale(
        tokenAddress,
        softCapWei,
        hardCapWei,
        startTimestamp,
        endTimestamp
      );

      await tx.wait();
      alert("Presale created successfully!");
      // Reset form
      setTokenAddress("");
      setSoftCap("");
      setHardCap("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error(err);
      alert("Failed to create presale: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="launchpad-page">
      <header className="launchpad-header">
        <div className="logo">
          <img src="/assets/logo.svg" alt="FSKSwap" />
          <span>FSKSwap</span>
        </div>
        <nav>
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/staking">Staking</a>
          <a href="/flashswap">FlashSwap</a>
        </nav>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="launchpad-container">
        <h2>Create Presale</h2>

        <div className="presale-form">
          <label>
            Token Address:
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
            />
          </label>

          <label>
            Soft Cap (BNB):
            <input
              type="number"
              value={softCap}
              onChange={(e) => setSoftCap(e.target.value)}
            />
          </label>

          <label>
            Hard Cap (BNB):
            <input
              type="number"
              value={hardCap}
              onChange={(e) => setHardCap(e.target.value)}
            />
          </label>

          <label>
            Start Time:
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>

          <label>
            End Time:
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>

          <button onClick={handleCreatePresale} disabled={loading}>
            {loading ? "Creating..." : "Create Presale"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default CreatePresale;
