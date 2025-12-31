"use client";

import { useEffect, useState, useRef } from "react";
import {
  Contract,
  BrowserProvider,
  JsonRpcProvider,
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

const useFarm = (provider: BrowserProvider | null, refreshInterval = 15_000) => {
  const [staking, setStaking] = useState<Contract | null>(null);
  const [farms, setFarms] = useState<FarmView[]>([]);
  const [user, setUser] = useState<string>("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------- INIT STAKING CONTRACT ---------- */
  useEffect(() => {
    const init = async () => {
      try {
        const readProvider = provider
          ? provider
          : new JsonRpcProvider(DEFAULT_BNB_RPC);

        let signer = null;
        let address = "";

        if (provider) {
          signer = await provider.getSigner();
          address = await signer.getAddress();
        }

        setUser(address);

        const contract = new Contract(
          stakingAddress,
          ABIS.FSKSwapLPStaking,
          signer ?? readProvider
        );

        setStaking(contract);
      } catch (err) {
        console.error("Staking init error:", err);
      }
    };

    init();
  }, [provider]);

  /* ---------- LOAD FARMS ---------- */
  const loadFarms = async () => {
    if (!staking || !user) return;

    try {
      const poolLength = Number(await staking.poolLength());
      const result: FarmView[] = [];

      const readProvider = staking.signer ?? new JsonRpcProvider(DEFAULT_BNB_RPC);

      for (let pid = 0; pid < poolLength; pid++) {
        const pool = await staking.poolInfo(pid);
        const pending: bigint = await staking.pendingReward(pid, user);
        const userInfo = await staking.userInfo(pid, user);

        const lp = new Contract(
          pool.lpToken,
          MINIMAL_ERC20_ABI,
          readProvider
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
    if (!staking || !user) return;

    loadFarms();

    intervalRef.current = setInterval(loadFarms, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [staking, user, refreshInterval]);

  /* ---------- ACTIONS ---------- */
  const stake = async (pid: number, amount: string) => {
    if (!staking || !provider) throw new Error("Wallet not connected");

    const signer = await provider.getSigner();
    const pool = await staking.poolInfo(pid);

    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);
    const decimals = await lp.decimals();
    const parsed = parseUnits(amount, decimals);

    const owner = await signer.getAddress();
    const allowance: bigint = await lp.allowance(owner, stakingAddress);

    if (allowance < parsed) {
      const tx = await lp.approve(stakingAddress, MaxUint256);
      await tx.wait();
    }

    const tx = await staking.connect(signer).deposit(pid, parsed);
    await tx.wait();
    await loadFarms();
  };

  const unstake = async (pid: number, amount: string) => {
    if (!staking || !provider) throw new Error("Wallet not connected");

    const signer = await provider.getSigner();
    const pool = await staking.poolInfo(pid);

    const parsed = parseUnits(amount, await new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer).decimals());

    const tx = await staking.connect(signer).withdraw(pid, parsed);
    await tx.wait();
    await loadFarms();
  };

  const claim = async (pid: number) => {
    if (!staking || !provider) throw new Error("Wallet not connected");

    const signer = await provider.getSigner();
    const tx = await staking.connect(signer).claim(pid);
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
