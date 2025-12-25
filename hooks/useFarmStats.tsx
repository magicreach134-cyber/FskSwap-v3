// hooks/useFarmStats.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { stakingAddress, ABIS, TOKEN_ADDRESS_MAP } from "../utils/constants";

interface FarmStat {
  pid: number;
  lpToken: string;
  lpName: string;
  lpSymbol: string;
  userStaked: string; // formatted
  totalStaked: string; // formatted
  pendingReward: string; // formatted
  rewardToken: string;
}

const useFarmStats = (provider: ethers.providers.Web3Provider, userAddress: string) => {
  const [stats, setStats] = useState<FarmStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!provider || !userAddress) return;

    const fetchStats = async () => {
      try {
        setLoading(true);

        const staking = new ethers.Contract(stakingAddress, ABIS.FSKSwapLPStaking, provider);
        const poolLength: number = await staking.poolLength();
        const data: FarmStat[] = [];

        for (let pid = 0; pid < poolLength; pid++) {
          const pool = await staking.poolInfo(pid);
          const lp = new ethers.Contract(
            pool.lpToken,
            ["function name() view returns (string)", "function symbol() view returns (string)"],
            provider
          );

          const [lpName, lpSymbol, totalStakedRaw, userStakedRaw, pendingRaw] = await Promise.all([
            lp.name(),
            lp.symbol(),
            staking.totalStaked(pid),
            staking.stakedBalance(pid, userAddress),
            staking.pendingReward(pid, userAddress),
          ]);

          data.push({
            pid,
            lpToken: pool.lpToken,
            lpName,
            lpSymbol,
            totalStaked: ethers.utils.formatUnits(totalStakedRaw, 18),
            userStaked: ethers.utils.formatUnits(userStakedRaw, 18),
            pendingReward: ethers.utils.formatUnits(pendingRaw, 18),
            rewardToken: TOKEN_ADDRESS_MAP.FSK, // assuming FSK as reward token
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

    fetchStats();
  }, [provider, userAddress]);

  return { stats, loading };
};

export default useFarmStats;
