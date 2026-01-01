"use client";

import { useEffect, useState, useRef } from "react";
import {
  Contract,
  BrowserProvider,
  JsonRpcProvider,
  Signer,
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

type ProviderLike = BrowserProvider | JsonRpcProvider;

const useFarm = (provider: BrowserProvider | null, refreshInterval = 15_000) => {
  const [stakingRead, setStakingRead] = useState<Contract | null>(null);
  const [farms, setFarms] = useState<FarmView[]>([]);
  const [user, setUser] = useState<string>("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------- INIT READ CONTRACT ---------- */
  useEffect(() => {
    const init = async () => {
      try {
        const readProvider: ProviderLike =
          provider ?? new JsonRpcProvider(DEFAULT_BNB_RPC);

        const contract = new Contract(
          stakingAddress,
          ABIS.FSKSwapLPStaking,
          readProvider
        );

        let address = "";
        if (provider) {
          const signer = await provider.getSigner();
          address = await signer.getAddress();
        }

        setUser(address);
        setStakingRead(contract);
      } catch (err) {
        console.error("Staking init error:", err);
      }
    };

    init();
  }, [provider]);

  /* ---------- LOAD FARMS ---------- */
  const loadFarms = async () => {
    if (!stakingRead || !user) return;

    try {
      const poolLength = Number(await stakingRead.poolLength());
      const result: FarmView[] = [];

      for (let pid = 0; pid < poolLength; pid++) {
        const pool = await stakingRead.poolInfo(pid);
        const pending: bigint = await stakingRead.pendingReward(pid, user);
        const userInfo = await stakingRead.userInfo(pid, user);

        const lp = new Contract(
          pool.lpToken,
          MINIMAL_ERC20_ABI,
          stakingRead.runner
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
    if (!stakingRead || !user) return;

    loadFarms();
    intervalRef.current = setInterval(loadFarms, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stakingRead, user, refreshInterval]);

  /* ---------- WRITE ACTIONS ---------- */
  const stake = async (signer: Signer, pid: number, amount: string) => {
    const staking = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      signer
    );

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

    const tx = await staking.deposit(pid, parsed);
    await tx.wait();
    await loadFarms();
  };

  const unstake = async (signer: Signer, pid: number, amount: string) => {
    const staking = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      signer
    );

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);

    const parsed = parseUnits(amount, await lp.decimals());

    const tx = await staking.withdraw(pid, parsed);
    await tx.wait();
    await loadFarms();
  };

  const claim = async (signer: Signer, pid: number) => {
    const staking = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      signer
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
