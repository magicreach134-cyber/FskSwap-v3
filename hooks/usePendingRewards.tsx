// hooks/usePendingRewards.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { stakingAddress, ABIS } from "../utils/constants";

interface PendingReward {
  pid: number;
  amount: string; // formatted in ether
}

const usePendingRewards = (provider: ethers.providers.Web3Provider, userAddress: string) => {
  const [rewards, setRewards] = useState<PendingReward[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!provider || !userAddress) return;

    const fetchRewards = async () => {
      try {
        setLoading(true);
        const staking = new ethers.Contract(stakingAddress, ABIS.FSKSwapLPStaking, provider);

        const poolLength: number = await staking.poolLength();
        const data: PendingReward[] = [];

        for (let pid = 0; pid < poolLength; pid++) {
          const pending = await staking.pendingReward(pid, userAddress);
          data.push({
            pid,
            amount: ethers.utils.formatUnits(pending, 18),
          });
        }

        setRewards(data);
      } catch (err) {
        console.error("usePendingRewards error:", err);
        setRewards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [provider, userAddress]);

  return { rewards, loading };
};

export default usePendingRewards;
