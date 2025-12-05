import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import "../style/staking.css";
import { FSKSwapLPStakingAddress, FSKSwapLPStakingABI, TokenList } from "../utils/constants";

const Staking = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [stakingPools, setStakingPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(TokenList[0]);
  const [stakeAmount, setStakeAmount] = useState("0");
  const [reward, setReward] = useState("0");

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      setSigner(tempProvider.getSigner());
    }
  }, []);

  useEffect(() => {
    const fetchReward = async () => {
      if (!signer) return;
      try {
        const stakingContract = new ethers.Contract(FSKSwapLPStakingAddress, FSKSwapLPStakingABI, signer);
        const rewardAmount = await stakingContract.pendingReward(selectedPool.address, await signer.getAddress());
        setReward(ethers.utils.formatUnits(rewardAmount, selectedPool.decimals));
      } catch (err) {
        console.error(err);
      }
    };
    fetchReward();
  }, [selectedPool, signer]);

  const handleStake = async () => {
    if (!signer || parseFloat(stakeAmount) <= 0) return;
    try {
      const stakingContract = new ethers.Contract(FSKSwapLPStakingAddress, FSKSwapLPStakingABI, signer);
      const tx = await stakingContract.stake(selectedPool.address, ethers.utils.parseUnits(stakeAmount, selectedPool.decimals));
      await tx.wait();
      alert("Staked successfully!");
    } catch (err) {
      console.error(err);
      alert("Stake failed: " + err.message);
    }
  };

  const handleClaim = async () => {
    if (!signer) return;
    try {
      const stakingContract = new ethers.Contract(FSKSwapLPStakingAddress, FSKSwapLPStakingABI, signer);
      const tx = await stakingContract.claimReward(selectedPool.address);
      await tx.wait();
      alert("Reward claimed!");
      setReward("0");
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
        <h2>LP Staking / Farming</h2>
        <div className="staking-form">
          <select value={selectedPool.symbol} onChange={e => setSelectedPool(TokenList.find(t => t.symbol === e.target.value))}>
            {TokenList.map(t => <option key={t.symbol}>{t.symbol}</option>)}
          </select>
          <input type="number" placeholder="Amount to Stake" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} />
          <button onClick={handleStake}>Stake</button>
          <p>Pending Reward: {reward} {selectedPool.symbol}</p>
          <button onClick={handleClaim}>Claim Reward</button>
        </div>
      </main>
    </div>
  );
};

export default Staking;
