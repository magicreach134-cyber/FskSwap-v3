"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Contract, JsonRpcProvider, BrowserProvider, parseUnits, formatUnits, MaxUint256, BigNumber } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import type { WalletClient } from "viem";

import { stakingAddress, ABIS, MINIMAL_ERC20_ABI, BNB_TESTNET_RPC } from "@/utils/constants";

export interface FarmView {
  pid: number;
  lpToken: string;
  name: string;
  symbol: string;
  decimals: number;
  staked: string;
  pending: string;
  balance: string;
  allowance: string;
}

/* ---------- READ PROVIDER ---------- */
const readProvider = new JsonRpcProvider(BNB_TESTNET_RPC);

/* ---------- VIEM → ETHERS SIGNER BRIDGE ---------- */
async function walletClientToSigner(walletClient: WalletClient) {
  const provider = new BrowserProvider(
    walletClient.transport as unknown as import("ethers").Eip1193Provider
  );
  return provider.getSigner();
}

const useFarm = (refreshInterval = 15_000) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [farms, setFarms] = useState<FarmView[]>([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------- READ CONTRACT ---------- */
  const stakingRead = useMemo(
    () => new Contract(stakingAddress, ABIS.FSKSwapLPStaking, readProvider),
    []
  );

  /* ---------- LOAD FARMS ---------- */
  const loadFarms = useCallback(async () => {
    if (!address || !isConnected) return;

    setLoading(true);
    try {
      const poolLength: number = Number(await stakingRead.poolLength());
      const results: FarmView[] = [];

      // batch load
      for (let pid = 0; pid < poolLength; pid++) {
        const [pool, user] = await Promise.all([
          stakingRead.poolInfo(pid),
          stakingRead.userInfo(pid, address),
        ]);

        const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, readProvider);
        const [name, symbol, decimals, balance, allowance] = await Promise.all([
          lp.name(),
          lp.symbol(),
          lp.decimals(),
          lp.balanceOf(address),
          lp.allowance(address, stakingAddress),
        ]);

        const pending: BigNumber = await stakingRead.pendingReward(pid, address);

        results.push({
          pid,
          lpToken: pool.lpToken,
          name,
          symbol,
          decimals,
          staked: formatUnits(user.amount, decimals),
          pending: formatUnits(pending, decimals),
          balance: formatUnits(balance, decimals),
          allowance: formatUnits(allowance, decimals),
        });
      }

      setFarms(results);
    } catch (err) {
      console.error("Farm load failed:", err);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected, stakingRead]);

  /* ---------- AUTO REFRESH ---------- */
  useEffect(() => {
    if (!isConnected) return;

    loadFarms();
    intervalRef.current = setInterval(loadFarms, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected, loadFarms, refreshInterval]);

  /* ---------- SIGNER ---------- */
  const getSigner = useCallback(async () => {
    if (!walletClient) throw new Error("Wallet not connected");
    return walletClientToSigner(walletClient);
  }, [walletClient]);

  /* ---------- STAKE ---------- */
  const stake = useCallback(
    async (pid: number, amount: string) => {
      if (!address) throw new Error("No wallet connected");

      const signer = await getSigner();
      const staking = new Contract(stakingAddress, ABIS.FSKSwapLPStaking, signer);
      const pool = await staking.poolInfo(pid);
      const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);
      const decimals = await lp.decimals();
      const value = parseUnits(amount, decimals);

      const allowance: BigNumber = await lp.allowance(address, stakingAddress);
      if (allowance.lt(value)) {
        const approveTx = await lp.approve(stakingAddress, MaxUint256);
        await approveTx.wait();
      }

      const tx = await staking.deposit(pid, value);
      await tx.wait();
      await loadFarms();
    },
    [address, getSigner, loadFarms]
  );

  /* ---------- UNSTAKE ---------- */
  const unstake = useCallback(
    async (pid: number, amount: string) => {
      if (!address) throw new Error("No wallet connected");

      const signer = await getSigner();
      const staking = new Contract(stakingAddress, ABIS.FSKSwapLPStaking, signer);
      const pool = await staking.poolInfo(pid);
      const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);

      const decimals = await lp.decimals();
      const value = parseUnits(amount, decimals);
      const tx = await staking.withdraw(pid, value);
      await tx.wait();
      await loadFarms();
    },
    [address, getSigner, loadFarms]
  );

  /* ---------- CLAIM SINGLE ---------- */
  const claim = useCallback(
    async (pid: number) => {
      const signer = await getSigner();
      const staking = new Contract(stakingAddress, ABIS.FSKSwapLPStaking, signer);

      const tx = await staking.claim(pid);
      await tx.wait();
      await loadFarms();
    },
    [getSigner, loadFarms]
  );

  /* ---------- CLAIM ALL ---------- */
  const claimAll = useCallback(async () => {
    if (!farms.length) return;
    const signer = await getSigner();
    const staking = new Contract(stakingAddress, ABIS.FSKSwapLPStaking, signer);

    for (const farm of farms) {
      const pending = parseFloat(farm.pending);
      if (pending > 0) {
        try {
          const tx = await staking.claim(farm.pid);
          await tx.wait();
        } catch (err) {
          console.error(`Claim failed for pid ${farm.pid}:`, err);
        }
      }
    }

    await loadFarms();
  }, [getSigner, farms, loadFarms]);

  return {
    farms,
    loading,
    stake,
    unstake,
    claim,
    claimAll,
    loadFarms,
  };
};

export default useFarm;
