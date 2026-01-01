"use client";

import { useEffect, useState, useRef } from "react";
import {
  Contract,
  JsonRpcProvider,
  BrowserProvider,
  parseUnits,
  formatUnits,
  MaxUint256,
} from "ethers";
import { useAccount, useWalletClient } from "wagmi";

import {
  stakingAddress,
  ABIS,
  MINIMAL_ERC20_ABI,
  BNB_TESTNET_RPC,
} from "@/utils/constants";

export interface FarmView {
  pid: number;
  lpToken: string;
  name: string;
  symbol: string;
  staked: string;
  pending: string;
}

const readProvider = new JsonRpcProvider(BNB_TESTNET_RPC);

const useFarm = (refreshInterval = 15_000) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [farms, setFarms] = useState<FarmView[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------- READ CONTRACT ---------- */
  const stakingRead = new Contract(
    stakingAddress,
    ABIS.FSKSwapLPStaking,
    readProvider
  );

  /* ---------- LOAD FARMS ---------- */
  const loadFarms = async () => {
    if (!address || !isConnected) return;

    try {
      const poolLength: bigint = await stakingRead.poolLength();
      const results: FarmView[] = [];

      for (let pid = 0; pid < Number(poolLength); pid++) {
        const pool = await stakingRead.poolInfo(pid);
        const user = await stakingRead.userInfo(pid, address);
        const pending: bigint = await stakingRead.pendingReward(pid, address);

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

        results.push({
          pid,
          lpToken: pool.lpToken,
          name,
          symbol,
          staked: formatUnits(user.amount, decimals),
          pending: formatUnits(pending, decimals),
        });
      }

      setFarms(results);
    } catch (e) {
      console.error("Farm load failed:", e);
    }
  };

  /* ---------- AUTO REFRESH ---------- */
  useEffect(() => {
    if (!isConnected) return;

    loadFarms();
    intervalRef.current = setInterval(loadFarms, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected, refreshInterval]);

  /* ---------- WRITE HELPERS ---------- */
  const getSigner = async () => {
    if (!walletClient) throw new Error("Wallet not connected");

    const provider = new BrowserProvider(walletClient.transport);
    return provider.getSigner();
  };

  /* ---------- ACTIONS ---------- */
  const stake = async (pid: number, amount: string) => {
    const signer = await getSigner();

    const staking = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      signer
    );

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);

    const decimals = await lp.decimals();
    const value = parseUnits(amount, decimals);

    const allowance: bigint = await lp.allowance(address, stakingAddress);
    if (allowance < value) {
      const approveTx = await lp.approve(stakingAddress, MaxUint256);
      await approveTx.wait();
    }

    const tx = await staking.deposit(pid, value);
    await tx.wait();

    await loadFarms();
  };

  const unstake = async (pid: number, amount: string) => {
    const signer = await getSigner();

    const staking = new Contract(
      stakingAddress,
      ABIS.FSKSwapLPStaking,
      signer
    );

    const pool = await staking.poolInfo(pid);
    const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);

    const value = parseUnits(amount, await lp.decimals());

    const tx = await staking.withdraw(pid, value);
    await tx.wait();

    await loadFarms();
  };

  const claim = async (pid: number) => {
    const signer = await getSigner();

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
