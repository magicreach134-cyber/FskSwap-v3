"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKSwapLPStakingABI, fskLPStakingAddress } from "../utils/constants";

export const useLPStaking = (signer, account) => {
  const [stakingContract, setStakingContract] = useState(null);
  const [stakedBalance, setStakedBalance] = useState("0");
  const [rewards, setRewards] = useState("0");

  useEffect(() => {
    if (!signer) return;
    const contract = new ethers.Contract(fskLPStakingAddress, FSKSwapLPStakingABI, signer);
    setStakingContract(contract);
  }, [signer]);

  useEffect(() => {
    if (!stakingContract || !account) return;
    const fetchBalances = async () => {
      const staked = await stakingContract.balanceOf(account);
      const reward = await stakingContract.earned(account);
      setStakedBalance(ethers.utils.formatUnits(staked, 18));
      setRewards(ethers.utils.formatUnits(reward, 18));
    };
    fetchBalances();
  }, [stakingContract, account]);

  const stake = async (amount) => {
    const tx = await stakingContract.stake(ethers.utils.parseUnits(amount.toString(), 18));
    return await tx.wait();
  };

  const unstake = async (amount) => {
    const tx = await stakingContract.withdraw(ethers.utils.parseUnits(amount.toString(), 18));
    return await tx.wait();
  };

  const claimRewards = async () => {
    const tx = await stakingContract.getReward();
    return await tx.wait();
  };

  return { stakedBalance, rewards, stake, unstake, claimRewards };
};
