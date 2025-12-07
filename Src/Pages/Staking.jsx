"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import { useLPStaking } from "../hooks/useLPStaking";
import "../styles/staking.css";

const StakingPage = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const { stakedBalance, rewards, stake, unstake, claimRewards } = useLPStaking(signer, account);

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setAccount);
    }
  }, []);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return alert("Enter valid stake amount");
    try {
      await stake(stakeAmount);
      alert("Stake successful!");
      setStakeAmount("");
    } catch (err) {
      console.error(err);
      alert("Stake failed: " + err.message);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) return alert("Enter valid unstake amount");
    try {
      await unstake(unstakeAmount);
      alert("Unstake successful!");
      setUnstakeAmount("");
    } catch (err) {
      console.error(err);
      alert("Unstake failed: " + err.message);
    }
  };

  const handleClaim = async () => {
    try {
      await claimRewards();
      alert("Rewards claimed!");
    } catch (err) {
      console.error(err);
      alert("Claim failed: " + err.message);
    }
  };

  return (
    <div className="staking-page">
      <header className="staking-header">
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

      <main className="staking-container">
        <h2>LP Staking</h2>

        <div className="staking-card">
          <p><strong>Staked Balance:</strong> {stakedBalance}</p>
          <p><strong>Rewards:</strong> {rewards}</p>

          <label>Stake Amount</label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />
          <button onClick={handleStake}>Stake</button>

          <label>Unstake Amount</label>
          <input
            type="number"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(e.target.value)}
          />
          <button onClick={handleUnstake}>Unstake</button>

          <button onClick={handleClaim}>Claim Rewards</button>
        </div>
      </main>
    </div>
  );
};

export default StakingPage;
