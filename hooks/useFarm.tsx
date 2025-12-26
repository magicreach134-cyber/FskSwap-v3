"use client";

import { useEffect, useState, useRef } from "react";
import { ethers, Contract, Signer } from "ethers";
import { stakingAddress, ABIS, MINIMAL_ERC20_ABI, DEFAULT_BNB_RPC } from "@/utils/constants";

export interface FarmView {
  pid: number;
  lpToken: string;
  name: string;
  symbol: string;
  staked: string;
  pending: string;
}

const useFarm = (signer?: Signer | null, refreshInterval = 15000) => {
  const [staking, setStaking] = useState<Contract | null>(null);
  const [farms, setFarms] = useState<FarmView[]>([]);
  const [user, setUser] = useState<string>("");
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  /* ---------- INIT STAKING CONTRACT ---------- */
  useEffect(() => {
    const init = async () => {
      try {
        const provider = signer ?? new ethers.BrowserProvider(DEFAULT_BNB_RPC);
        const address = signer ? await signer.getAddress() : "";
        setUser(address);

        const contract = new Contract(stakingAddress, ABIS.FSKSwapLPStaking, signer ?? provider);
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
      const loaded: FarmView[] = [];

      for (let pid = 0n; pid < poolLength; pid++) {
        const pool = await staking.poolInfo(pid);
        const pending: bigint = await staking.pendingReward(pid, user);
        const userInfo = await staking.userInfo(pid, user);

        const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, staking.signer);
        const [name, symbol, decimals] = await Promise.all([
          lp.name(),
          lp.symbol(),
          lp.decimals()
        ]);

        loaded.push({
          pid: Number(pid),
          lpToken: pool.lpToken,
          name,
          symbol,
          staked: ethers.formatUnits(userInfo.amount, decimals),
          pending: ethers.formatUnits(pending, decimals),
        });
      }

      setFarms(loaded);
    } catch (err) {
      console.error("Farm load error:", err);
    }
  };

  /* ---------- AUTO REFRESH FARMS ---------- */
  useEffect(() => {
    if (!staking || !user) return;

    loadFarms(); // initial load

    intervalRef.current = setInterval(() => {
      loadFarms().catch(console.error);
    }, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [staking, user, refreshInterval]);

  /* ---------- ACTIONS ---------- */
  const stake = async (pid: number, amount: string) => {
    if (!staking || !user) throw new Error("Staking contract not ready");

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, staking.signer);
    const decimals = await lp.decimals();
    const parsed = ethers.parseUnits(amount, decimals);

    const allowance: bigint = await lp.allowance(user, stakingAddress);
    if (allowance < parsed) {
      const approveTx = await lp.approve(stakingAddress, ethers.MaxUint256);
      await approveTx.wait();
    }

    const tx = await staking.deposit(pid, parsed);
    await tx.wait();

    await loadFarms(); // refresh after staking
  };

  const unstake = async (pid: number, amount: string) => {
    if (!staking || !user) throw new Error("Staking contract not ready");

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, staking.signer);
    const decimals = await lp.decimals();
    const parsed = ethers.parseUnits(amount, decimals);

    const tx = await staking.withdraw(pid, parsed);
    await tx.wait();

    await loadFarms(); // refresh after unstaking
  };

  const claim = async (pid: number) => {
    if (!staking || !user) throw new Error("Staking contract not ready");

    const tx = await staking.claim(pid);
    await tx.wait();

    await loadFarms(); // refresh after claiming
  };

  return {
    farms,
    stake,
    unstake,
    claim,
  };
};

export default useFarm;
