"use client";

import { useEffect, useState, useRef } from "react";
import { Contract, parseUnits, formatUnits, MaxUint256 } from "ethers";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from "wagmi";

import {
  stakingAddress,
  ABIS,
  MINIMAL_ERC20_ABI,
} from "@/utils/constants";

export interface FarmView {
  pid: number;
  lpToken: string;
  name: string;
  symbol: string;
  staked: string;
  pending: string;
}

const useFarm = (refreshInterval = 15_000) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [stakingRead, setStakingRead] = useState<Contract | null>(null);
  const [farms, setFarms] = useState<FarmView[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------- INIT READ CONTRACT ---------- */
  useEffect(() => {
    if (!publicClient) return;

    const contract = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      publicClient
    );

    setStakingRead(contract);
  }, [publicClient]);

  /* ---------- LOAD FARMS ---------- */
  const loadFarms = async () => {
    if (!stakingRead || !address) return;

    try {
      const poolLength = Number(await stakingRead.poolLength());
      const result: FarmView[] = [];

      for (let pid = 0; pid < poolLength; pid++) {
        const pool = await stakingRead.poolInfo(pid);
        const pending: bigint = await stakingRead.pendingReward(pid, address);
        const userInfo = await stakingRead.userInfo(pid, address);

        const lp = new Contract(
          pool.lpToken,
          MINIMAL_ERC20_ABI,
          publicClient
        );

        const [name, symbol, decimals] = await Promise.all([
          lp.name(),
          lp.symbol(),
          lp.decimals(),
        ]);

        result.push({
          pid,
          lpToken: pool.lpToken,
          name,
          symbol,
          staked: formatUnits(userInfo.amount, decimals),
          pending: formatUnits(pending, decimals),
        });
      }

      setFarms(result);
    } catch (err) {
      console.error("Farm load error:", err);
    }
  };

  /* ---------- AUTO REFRESH ---------- */
  useEffect(() => {
    if (!stakingRead || !isConnected) return;

    loadFarms();
    intervalRef.current = setInterval(loadFarms, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stakingRead, isConnected, refreshInterval]);

  /* ---------- WRITE ACTIONS ---------- */
  const stake = async (pid: number, amount: string) => {
    if (!walletClient || !address) throw new Error("Wallet not connected");

    const signer = walletClient;
    const staking = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      signer
    );

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);

    const decimals = await lp.decimals();
    const parsed = parseUnits(amount, decimals);

    const allowance: bigint = await lp.allowance(address, stakingAddress);
    if (allowance < parsed) {
      const tx = await lp.approve(stakingAddress, MaxUint256);
      await tx.wait();
    }

    const tx = await staking.deposit(pid, parsed);
    await tx.wait();
    await loadFarms();
  };

  const unstake = async (pid: number, amount: string) => {
    if (!walletClient) throw new Error("Wallet not connected");

    const staking = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      walletClient
    );

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, walletClient);

    const parsed = parseUnits(amount, await lp.decimals());
    const tx = await staking.withdraw(pid, parsed);

    await tx.wait();
    await loadFarms();
  };

  const claim = async (pid: number) => {
    if (!walletClient) throw new Error("Wallet not connected");

    const staking = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      walletClient
    );

    const tx = await staking.claim(pid);
    await tx.wait();
    await loadFarms();
  };

  return {
    farms,
    stake,
    unstake,
    claim,
  };
};

export default useFarm;
