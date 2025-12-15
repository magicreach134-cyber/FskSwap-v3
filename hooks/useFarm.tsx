"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKFarm, FSKFarmABI, ERC20ABI } from "../utils/constants";

const useFarm = (signer?: ethers.Signer) => {
  const [farmContract, setFarmContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      try {
        const contract = new ethers.Contract(FSKFarm, FSKFarmABI, signer);
        setFarmContract(contract);
      } catch (err) {
        console.error("Failed to initialize farm contract:", err);
      }
    }
  }, [signer]);

  // Helper: fetch token decimals
  const getTokenDecimals = async (tokenAddress: string) => {
    if (!signer) return 18;
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);
      return await tokenContract.decimals();
    } catch (err) {
      console.error("getTokenDecimals error:", err);
      return 18;
    }
  };

  // Fetch staked balance for a user
  const getStakedBalance = async (account: string, lpToken: string) => {
    if (!farmContract) return "0";
    try {
      const balance = await farmContract.stakedBalance(lpToken, account);
      const decimals = await getTokenDecimals(lpToken);
      return ethers.utils.formatUnits(balance, decimals);
    } catch (err) {
      console.error("getStakedBalance error:", err);
      return "0";
    }
  };

  // Fetch pending rewards
  const getPendingRewards = async (account: string) => {
    if (!farmContract) return "0";
    try {
      const rewards = await farmContract.pendingReward(account);
      return ethers.utils.formatUnits(rewards, 18);
    } catch (err) {
      console.error("getPendingRewards error:", err);
      return "0";
    }
  };

  // Stake LP tokens
  const stakeTokens = async (lpToken: string, amount: string) => {
    if (!farmContract) throw new Error("Farm contract not initialized");
    try {
      const decimals = await getTokenDecimals(lpToken);
      const tx = await farmContract.stake(lpToken, ethers.utils.parseUnits(amount, decimals));
      return await tx.wait();
    } catch (err) {
      console.error("stakeTokens error:", err);
      throw err;
    }
  };

  // Withdraw staked LP tokens
  const withdrawTokens = async (lpToken: string, amount: string) => {
    if (!farmContract) throw new Error("Farm contract not initialized");
    try {
      const decimals = await getTokenDecimals(lpToken);
      const tx = await farmContract.withdraw(lpToken, ethers.utils.parseUnits(amount, decimals));
      return await tx.wait();
    } catch (err) {
      console.error("withdrawTokens error:", err);
      throw err;
    }
  };

  // Claim rewards
  const claimRewards = async () => {
    if (!farmContract) throw new Error("Farm contract not initialized");
    try {
      const tx = await farmContract.claimRewards();
      return await tx.wait();
    } catch (err) {
      console.error("claimRewards error:", err);
      throw err;
    }
  };

  return {
    farmContract,
    getStakedBalance,
    getPendingRewards,
    stakeTokens,
    withdrawTokens,
    claimRewards,
  };
};

export default useFarm;
