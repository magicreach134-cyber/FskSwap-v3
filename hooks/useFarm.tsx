"use client";

import { useEffect, useState, useRef } from "react";
import {
  Contract,
  BrowserProvider,
  JsonRpcProvider,
  JsonRpcSigner,
  parseUnits,
  formatUnits,
  MaxUint256,
} from "ethers";

import {
  stakingAddress,
  ABIS,
  MINIMAL_ERC20_ABI,
  DEFAULT_BNB_RPC,
} from "@/utils/constants";

export interface FarmView {
  pid: number;
  lpToken: string;
  name: string;
  symbol: string;
  staked: string;
  pending: string;
}

const useFarm = (
  signer: JsonRpcSigner | null,
  refreshInterval = 15_000
) => {
  const [staking, setStaking] = useState<Contract | null>(null);
  const [farms, setFarms] = useState<FarmView[]>([]);
  const [user, setUser] = useState<string>("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------- INIT STAKING CONTRACT ---------- */
  useEffect(() => {
    const init = async () => {
      try {
        const provider =
          signer?.provider ??
          new JsonRpcProvider(DEFAULT_BNB_RPC);

        const address = signer ? await signer.getAddress() : "";
        setUser(address);

        const contract = new Contract(
          stakingAddress,
          ABIS.FSKSwapLPStaking,
          signer ?? provider
        );

        setStaking(contract);
      } catch (err) {
        console.error("Staking init error:", err);
      }
    };

    init();
  }, [signer]);

  /* ---------- LOAD FARMS ---------- */
  const loadFarms = async () => {
    if (!staking || !user) return;

    try {
      const poolLength: bigint = await staking.poolLength();
      const result: FarmView[] = [];

      for (let pid = 0n; pid < poolLength; pid++) {
        const pool = await staking.poolInfo(pid);
        const pending: bigint = await staking.pendingReward(pid, user);
        const userInfo = await staking.userInfo(pid, user);

        const lp = new Contract(
          pool.lpToken,
          MINIMAL_ERC20_ABI,
          staking.runner
        );

        const [name, symbol, decimals] = await Promise.all([
          lp.name(),
          lp.symbol(),
          lp.decimals(),
        ]);

        result.push({
          pid: Number(pid),
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
    if (!staking || !user) return;

    loadFarms().catch(console.error);

    intervalRef.current = setInterval(() => {
      loadFarms().catch(console.error);
    }, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [staking, user, refreshInterval]);

  /* ---------- ACTIONS ---------- */
  const stake = async (pid: number, amount: string) => {
    if (!staking || !signer) throw new Error("Wallet not connected");

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);
    const decimals = await lp.decimals();

    const parsed = parseUnits(amount, decimals);

    const allowance: bigint = await lp.allowance(user, stakingAddress);
    if (allowance < parsed) {
      const tx = await lp.approve(stakingAddress, MaxUint256);
      await tx.wait();
    }

    const tx = await staking.deposit(pid, parsed);
    await tx.wait();
    await loadFarms();
  };

  const unstake = async (pid: number, amount: string) => {
    if (!staking || !signer) throw new Error("Wallet not connected");

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);
    const decimals = await lp.decimals();

    const parsed = parseUnits(amount, decimals);

    const tx = await staking.withdraw(pid, parsed);
    await tx.wait();
    await loadFarms();
  };

  const claim = async (pid: number) => {
    if (!staking || !signer) throw new Error("Wallet not connected");

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
