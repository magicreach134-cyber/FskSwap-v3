"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Contract, JsonRpcProvider, BrowserProvider, parseUnits, formatUnits, MaxUint256 } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import type { WalletClient } from "viem";

import { stakingAddress, ABIS, MINIMAL_ERC20_ABI, BNB_TESTNET_RPC } from "@/utils/constants";

export interface FarmView {
  pid: number;
  lpToken: string;
  name: string;
  symbol: string;
  staked: string;
  pending: string;
}

const readProvider = useMemo(() => new JsonRpcProvider(BNB_TESTNET_RPC), []);

async function walletClientToSigner(walletClient: WalletClient) {
  const provider = new BrowserProvider(walletClient.transport as unknown as import("ethers").Eip1193Provider);
  return provider.getSigner();
}

const useFarm = (refreshInterval = 15_000) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [farms, setFarms] = useState<FarmView[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stakingRead = useMemo(() => new Contract(stakingAddress, ABIS.FSKSwapLPStaking, readProvider), []);

  const loadFarms = useCallback(async () => {
    if (!address || !isConnected) return;

    try {
      const poolLength: number = Number(await stakingRead.poolLength());
      const results: FarmView[] = [];

      for (let pid = 0; pid < poolLength; pid++) {
        const pool = await stakingRead.poolInfo(pid);
        const user = await stakingRead.userInfo(pid, address);
        const pending: bigint = await stakingRead.pendingReward(pid, address);

        const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, readProvider);
        const [name, symbol, decimals] = await Promise.all([lp.name(), lp.symbol(), lp.decimals()]);

        results.push({
          pid,
          lpToken: pool.lpToken,
          name,
          symbol,
          staked: formatUnits(user.amount, decimals),
          pending: formatUnits(pending, 18), // Assuming reward token (FSK) decimals = 18
        });
      }

      setFarms(results);
    } catch (err) {
      console.error("Farm load failed:", err);
    }
  }, [address, isConnected, stakingRead]);

  useEffect(() => {
    if (!isConnected) return;

    loadFarms();
    intervalRef.current = setInterval(loadFarms, refreshInterval);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [isConnected, refreshInterval, loadFarms]);

  const getSigner = useCallback(async () => {
    if (!walletClient) throw new Error("Wallet not connected");
    return walletClientToSigner(walletClient);
  }, [walletClient]);

  const stake = useCallback(
    async (pid: number, amount: string) => {
      if (!address) throw new Error("No wallet connected");

      try {
        const signer = await getSigner();
        const staking = new Contract(stakingAddress, ABIS.FSKSwapLPStaking, signer);
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
      } catch (err) {
        console.error("Stake failed:", err);
      }
    },
    [address, getSigner, loadFarms]
  );

  const unstake = useCallback(
    async (pid: number, amount: string) => {
      if (!address) throw new Error("No wallet connected");

      try {
        const signer = await getSigner();
        const staking = new Contract(stakingAddress, ABIS.FSKSwapLPStaking, signer);
        const pool = await staking.poolInfo(pid);
        const lp = new Contract(pool.lpToken, MINIMAL_ERC20_ABI, signer);

        const value = parseUnits(amount, await lp.decimals());
        const tx = await staking.withdraw(pid, value);
        await tx.wait();

        await loadFarms();
      } catch (err) {
        console.error("Unstake failed:", err);
      }
    },
    [getSigner, address, loadFarms]
  );

  const claim = useCallback(
    async (pid: number) => {
      try {
        const signer = await getSigner();
        const staking = new Contract(stakingAddress, ABIS.FSKSwapLPStaking, signer);

        const tx = await staking.claim(pid);
        await tx.wait();

        await loadFarms();
      } catch (err) {
        console.error("Claim failed:", err);
      }
    },
    [getSigner, loadFarms]
  );

  return { farms, stake, unstake, claim, loadFarms };
};

export default useFarm;
