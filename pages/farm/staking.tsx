"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import useFarm from "../../hooks/useFarm";
import useWallet from "../../hooks/useWallet"; // Your wallet connection hook

const StakingPage = () => {
  const { signer, account } = useWallet();
  const { getStakedBalance, getPendingRewards, stakeTokens, withdrawTokens, claimRewards } = useFarm(signer);

  const [lpAmount, setLpAmount] = useState("0");
  const [staked, setStaked] = useState("0");
  const [pending, setPending] = useState("0");
  const lpTokenAddress = "0xYourLpTokenAddress"; // Replace with your LP token

  const refreshData = async () => {
    if (!account) return;
    const stakedBal = await getStakedBalance(account, lpTokenAddress);
    const pendingRewards = await getPendingRewards(account);
    setStaked(stakedBal);
    setPending(pendingRewards);
  };

  useEffect(() => {
    refreshData();
  }, [account]);

  const handleStake = async () => {
    await stakeTokens(lpTokenAddress, lpAmount);
    setLpAmount("0");
    await refreshData();
  };

  const handleWithdraw = async () => {
    await withdrawTokens(lpTokenAddress, lpAmount);
    setLpAmount("0");
    await refreshData();
  };

  const handleClaim = async () => {
    await claimRewards();
    await refreshData();
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Farm Staking</h2>
      <p>Staked: {staked}</p>
      <p>Pending Rewards: {pending}</p>

      <div className="mt-4">
        <input
          type="text"
          value={lpAmount}
          onChange={(e) => setLpAmount(e.target.value)}
          placeholder="Amount"
          className="border p-2 mr-2"
        />
        <button onClick={handleStake} className="bg-green-500 text-white p-2 rounded mr-2">
          Stake
        </button>
        <button onClick={handleWithdraw} className="bg-red-500 text-white p-2 rounded">
          Withdraw
        </button>
      </div>

      <div className="mt-4">
        <button onClick={handleClaim} className="bg-blue-500 text-white p-2 rounded">
          Claim Rewards
        </button>
      </div>
    </div>
  );
};

export default StakingPage;
