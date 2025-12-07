// src/pages/Staking.jsx
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "../style/staking.css";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";

import {
  stakingAddress,
  lpTokenAddress,
  StakingABI,
  LPTokenABI,
} from "../utils/constants";

export default function Staking() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [user, setUser] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [balances, setBalances] = useState({
    walletLP: "0",
    stakedLP: "0",
    pendingReward: "0",
    apr: "0",
  });

  const loadWallet = async () => {
    if (!window.ethereum) return;
    const _provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(_provider);
    const _signer = _provider.getSigner();
    setSigner(_signer);

    try {
      const addr = await _signer.getAddress();
      setUser(addr);
    } catch {}
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const loadData = async () => {
    if (!signer || !user) return;

    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, signer);
    const lpToken = new ethers.Contract(lpTokenAddress, LPTokenABI, signer);

    const walletLP = await lpToken.balanceOf(user);
    const stakedLP = await stakingContract.balanceOf(user);
    const pendingReward = await stakingContract.pendingReward(user);
    const apr = await stakingContract.apr(); // Contract must have apr()

    setBalances({
      walletLP: ethers.utils.formatEther(walletLP),
      stakedLP: ethers.utils.formatEther(stakedLP),
      pendingReward: ethers.utils.formatEther(pendingReward),
      apr: apr.toString(),
    });
  };

  useEffect(() => {
    loadData();
  }, [signer, user]);

  const stake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return alert("Enter valid amount");

    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, signer);
    const lpToken = new ethers.Contract(lpTokenAddress, LPTokenABI, signer);

    const amountWei = ethers.utils.parseEther(stakeAmount);

    // check allowance
    const allowance = await lpToken.allowance(user, stakingAddress);

    if (allowance.lt(amountWei)) {
      const tx1 = await lpToken.approve(stakingAddress, amountWei);
      await tx1.wait();
    }

    const tx2 = await stakingContract.stake(amountWei);
    await tx2.wait();

    alert("Stake successful");
    setStakeAmount("");
    loadData();
  };

  const unstake = async () => {
    if (!balances.stakedLP || parseFloat(balances.stakedLP) <= 0)
      return alert("No LP staked");

    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, signer);
    const tx = await stakingContract.unstake();
    await tx.wait();

    alert("Unstaked successfully");
    loadData();
  };

  const claim = async () => {
    const stakingContract = new ethers.Contract(stakingAddress, StakingABI, signer);
    const tx = await stakingContract.claimReward();
    await tx.wait();

    alert("Rewards claimed");
    loadData();
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
          <a href="/flashswap">FlashSwap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/staking">Staking</a>
        </nav>

        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="staking-container">
        <h2>LP Staking & Farming</h2>

        <div className="staking-stats">
          <p><strong>Wallet LP:</strong> {balances.walletLP}</p>
          <p><strong>Staked LP:</strong> {balances.stakedLP}</p>
          <p><strong>Pending Rewards:</strong> {balances.pendingReward} FSK</p>
          <p><strong>APR:</strong> {balances.apr}%</p>
        </div>

        <div className="staking-actions">
          <input
            type="number"
            placeholder="Enter LP amount"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
          />

          <button className="stake-btn" onClick={stake}>Stake LP</button>
          <button className="unstake-btn" onClick={unstake}>Unstake All</button>
          <button className="claim-btn" onClick={claim}>Claim Rewards</button>
        </div>
      </main>
    </div>
  );
}
