// hooks/useFarmStats.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import useLPTokenPrice from "./useLPTokenPrice";
import useFarmAPY from "./useFarmAPY";
import { FSKSwapLPStaking, ABIS } from "../utils/constants";

export interface UserFarmStats {
  pid: number;
  lpAddress: string;
  name: string;
  symbol: string;
  stakedAmount: string; // formatted string
  pendingReward: string; // formatted string
  lpPriceUSD: number;
  totalStakedUSD: number;
  apy: number;
}

const useFarmStats = (
  provider: ethers.providers.Web3Provider,
  userAddress: string,
  farms: { pid: number; lpAddress: string; name: string; symbol: string }[],
  rewardTokenPriceUSD: number
) => {
  const [stats, setStats] = useState<UserFarmStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch LP prices
  const { lpData, loading: lpLoading } = useLPTokenPrice(
    provider,
    farms.map((f) => f.lpAddress),
    { FSK: rewardTokenPriceUSD }
  );

  // Fetch APY
  const { apyData, loading: apyLoading } = useFarmAPY(
    provider,
    farms.map((f) => ({ pid: f.pid, lpAddress: f.lpAddress })),
    rewardTokenPriceUSD
  );

  useEffect(() => {
    if (!provider || !userAddress || lpLoading || apyLoading) return;

    const stakingContract = new ethers.Contract(
      FSKSwapLPStaking,
      ABIS.FSKSwapLPStaking,
      provider
    );

    const loadStats = async () => {
      setLoading(true);
      try {
        const data: UserFarmStats[] = [];

        for (const farm of farms) {
          const [stakedRaw, pendingRaw] = await Promise.all([
            stakingContract.stakedBalance(farm.lpAddress, userAddress),
            stakingContract.pendingReward(farm.lpAddress, userAddress),
          ]);

          const decimals = 18; // assuming 18 decimals for LP tokens, can be dynamic if needed
          const stakedAmount = ethers.utils.formatUnits(stakedRaw, decimals);
          const pendingReward = ethers.utils.formatUnits(pendingRaw, decimals);

          const lpInfo = lpData.find((lp) => lp.lpAddress === farm.lpAddress);
          const apyInfo = apyData.find((ap) => ap.lpAddress === farm.lpAddress);

          data.push({
            pid: farm.pid,
            lpAddress: farm.lpAddress,
            name: farm.name,
            symbol: farm.symbol,
            stakedAmount,
            pendingReward,
            lpPriceUSD: lpInfo?.lpPriceUSD || 0,
            totalStakedUSD: apyInfo?.totalStakedUSD || 0,
            apy: apyInfo?.apy || 0,
          });
        }

        setStats(data);
      } catch (err) {
        console.error("useFarmStats error:", err);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [provider, userAddress, farms, lpData, apyData, lpLoading, apyLoading]);

  return { stats, loading };
};

export default useFarmStats;
