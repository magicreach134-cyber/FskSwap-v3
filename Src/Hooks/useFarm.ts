// src/hooks/useFarm.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKSwapLPStakingABI, fskLPStakingAddress } from "../utils/constants";

export const useFarm = (signer: ethers.Signer | null, account: string | null) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [stakedBalance, setStakedBalance] = useState("0");
  const [rewards, setRewards] = useState("0");

  useEffect(() => {
    if (!signer) return;
    setContract(new ethers.Contract(fskLPStakingAddress, FSKSwapLPStakingABI, signer));
  }, [signer]);

  useEffect(() => {
    if (!contract || !account) return;
    const fetchBalances = async () => {
      const staked = await contract.balanceOf(account);
      const earned = await contract.earned(account);
      setStakedBalance(ethers.utils.formatUnits(staked, 18));
      setRewards(ethers.utils.formatUnits(earned, 18));
    };
    fetchBalances();
  }, [contract, account]);

  const stake = async (amount: string) => {
    if (!contract) throw new Error("Staking contract not initialized");
    const tx = await contract.stake(ethers.utils.parseUnits(amount, 18));
    return await tx.wait();
  };

  const unstake = async (amount: string) => {
    if (!contract) throw new Error("Staking contract not initialized");
    const tx = await contract.withdraw(ethers.utils.parseUnits(amount, 18));
    return await tx.wait();
  };

  const claim = async () => {
    if (!contract) throw new Error("Staking contract not initialized");
    const tx = await contract.getReward();
    return await tx.wait();
  };

  return { stakedBalance, rewards, stake, unstake, claim };
};
