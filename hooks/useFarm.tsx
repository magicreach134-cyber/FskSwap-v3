"use client";

import { useState, useEffect, useCallback } from "react";
import { Contract, JsonRpcSigner, ethers } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";

// Import your farm ABI and LP token ABI
import FarmAbi from "@/abis/Farm.json";
import ERC20Abi from "@/abis/ERC20.json";

// Types
export interface FarmView {
  pid: number;
  name: string;
  symbol: string;
  lpToken: string;
  staked: string;
  pending: string;
  rewardToken: string;
  rewardSymbol: string;
  lpDecimals: number;
  rewardDecimals: number;
  allowance: string;
}

// Hook
export default function useFarm(signer: JsonRpcSigner | null) {
  const [farms, setFarms] = useState<FarmView[]>([]);
  const [loadingFarmIds, setLoadingFarmIds] = useState<number[]>([]);

  // Replace with your deployed farm addresses
  const FARM_ADDRESSES = [
    { pid: 0, farm: "0xYourFarmContract1" },
    { pid: 1, farm: "0xYourFarmContract2" },
  ];

  const loadFarms = useCallback(async () => {
    if (!signer) return;
    const provider = signer.provider;
    const loadedFarms: FarmView[] = [];

    for (let farmInfo of FARM_ADDRESSES) {
      try {
        const farmContract = new Contract(farmInfo.farm, FarmAbi, signer);

        // LP token info
        const lpTokenAddress: string = await farmContract.lpToken();
        const lpContract = new Contract(lpTokenAddress, ERC20Abi, signer);
        const lpDecimals: number = await lpContract.decimals();
        const lpSymbol: string = await lpContract.symbol();
        const userLp = signer ? await lpContract.balanceOf(await signer.getAddress()) : ethers.constants.Zero;
        const allowance = signer ? await lpContract.allowance(await signer.getAddress(), farmInfo.farm) : ethers.constants.Zero;

        // Reward info
        const rewardToken: string = await farmContract.rewardToken();
        const rewardContract = new Contract(rewardToken, ERC20Abi, signer);
        const rewardDecimals: number = await rewardContract.decimals();
        const rewardSymbol: string = await rewardContract.symbol();

        const pending = signer ? await farmContract.pendingReward(await signer.getAddress()) : ethers.constants.Zero;
        const staked = signer ? await farmContract.userInfo(await signer.getAddress()) : { amount: ethers.constants.Zero };

        loadedFarms.push({
          pid: farmInfo.pid,
          name: `Farm ${farmInfo.pid}`,
          symbol: lpSymbol,
          lpToken: lpTokenAddress,
          staked: formatUnits(staked.amount, lpDecimals),
          pending: formatUnits(pending, rewardDecimals),
          rewardToken,
          rewardSymbol,
          lpDecimals,
          rewardDecimals,
          allowance: formatUnits(allowance, lpDecimals),
        });
      } catch (err) {
        console.error(`Failed to load farm ${farmInfo.pid}:`, err);
      }
    }

    setFarms(loadedFarms);
  }, [signer]);

  // Approve LP tokens for staking
  const approve = async (farmPid: number, amount: string) => {
    if (!signer) throw new Error("Signer not connected");
    const farm = farms.find((f) => f.pid === farmPid);
    if (!farm) throw new Error("Farm not found");

    const lpContract = new Contract(farm.lpToken, ERC20Abi, signer);
    const tx = await lpContract.approve(FARM_ADDRESSES[farmPid].farm, parseUnits(amount, farm.lpDecimals));
    setLoadingFarmIds((prev) => [...prev, farmPid]);
    await tx.wait();
    setLoadingFarmIds((prev) => prev.filter((id) => id !== farmPid));
    await loadFarms();
  };

  // Stake LP tokens
  const stake = async (farmPid: number, amount: string) => {
    if (!signer) throw new Error("Signer not connected");
    const farmContract = new Contract(FARM_ADDRESSES[farmPid].farm, FarmAbi, signer);
    const farm = farms.find((f) => f.pid === farmPid);
    if (!farm) throw new Error("Farm not found");

    setLoadingFarmIds((prev) => [...prev, farmPid]);
    const tx = await farmContract.deposit(parseUnits(amount, farm.lpDecimals));
    await tx.wait();
    setLoadingFarmIds((prev) => prev.filter((id) => id !== farmPid));
    await loadFarms();
  };

  // Unstake LP tokens
  const unstake = async (farmPid: number, amount: string) => {
    if (!signer) throw new Error("Signer not connected");
    const farmContract = new Contract(FARM_ADDRESSES[farmPid].farm, FarmAbi, signer);
    const farm = farms.find((f) => f.pid === farmPid);
    if (!farm) throw new Error("Farm not found");

    setLoadingFarmIds((prev) => [...prev, farmPid]);
    const tx = await farmContract.withdraw(parseUnits(amount, farm.lpDecimals));
    await tx.wait();
    setLoadingFarmIds((prev) => prev.filter((id) => id !== farmPid));
    await loadFarms();
  };

  // Claim rewards
  const claim = async (farmPid: number) => {
    if (!signer) throw new Error("Signer not connected");
    const farmContract = new Contract(FARM_ADDRESSES[farmPid].farm, FarmAbi, signer);

    setLoadingFarmIds((prev) => [...prev, farmPid]);
    const tx = await farmContract.claim();
    await tx.wait();
    setLoadingFarmIds((prev) => prev.filter((id) => id !== farmPid));
    await loadFarms();
  };

  return {
    farms,
    loadFarms,
    approve,
    stake,
    unstake,
    claim,
    loadingFarmIds,
  };
}
