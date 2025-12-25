// hooks/useFarmAPY.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKSwapLPStaking, ABIS } from "../utils/constants";
import useLPTokenPrice from "./useLPTokenPrice";

interface FarmAPYInfo {
  pid: number;
  lpAddress: string;
  rewardPerBlock: string;
  lpPriceUSD: number;
  totalStakedUSD: number;
  apy: number;
}

/**
 * Computes APY for LP farms.
 * @param provider ethers provider
 * @param farms array of farm info with pid and lpAddress
 * @param tokenPriceUSD price of reward token in USD
 */
const useFarmAPY = (
  provider: ethers.providers.Web3Provider,
  farms: { pid: number; lpAddress: string }[],
  rewardTokenPriceUSD: number
) => {
  const [apyData, setApyData] = useState<FarmAPYInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Get LP prices
  const { lpData, loading: lpLoading } = useLPTokenPrice(
    provider,
    farms.map((f) => f.lpAddress),
    { FSK: rewardTokenPriceUSD } // replace or extend with token prices if needed
  );

  useEffect(() => {
    if (!provider || farms.length === 0 || lpLoading) return;

    const stakingContract = new ethers.Contract(
      FSKSwapLPStaking,
      ABIS.FSKSwapLPStaking,
      provider
    );

    const fetchAPY = async () => {
      setLoading(true);
      try {
        const blockPerYear = 10512000; // ~3s per block, BSC ~10512000 blocks/year

        const data: FarmAPYInfo[] = [];

        for (const farm of farms) {
          const [totalStakedRaw, rewardPerBlockRaw] = await Promise.all([
            stakingContract.totalStaked(farm.lpAddress),
            stakingContract.rewardPerBlock(farm.lpAddress),
          ]);

          const lpPriceObj = lpData.find((lp) => lp.lpAddress === farm.lpAddress);
          const lpPriceUSD = lpPriceObj ? lpPriceObj.lpPriceUSD : 0;

          const totalStaked = parseFloat(
            ethers.utils.formatUnits(totalStakedRaw, 18)
          );
          const rewardPerBlock = parseFloat(
            ethers.utils.formatUnits(rewardPerBlockRaw, 18)
          );

          const totalStakedUSD = totalStaked * lpPriceUSD;
          const yearlyRewardsUSD = rewardPerBlock * blockPerYear * rewardTokenPriceUSD;
          const apy = totalStakedUSD > 0 ? (yearlyRewardsUSD / totalStakedUSD) * 100 : 0;

          data.push({
            pid: farm.pid,
            lpAddress: farm.lpAddress,
            rewardPerBlock: rewardPerBlockRaw.toString(),
            lpPriceUSD,
            totalStakedUSD,
            apy,
          });
        }

        setApyData(data);
      } catch (err) {
        console.error("useFarmAPY error:", err);
        setApyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAPY();
  }, [provider, farms, lpData, lpLoading, rewardTokenPriceUSD]);

  return { apyData, loading };
};

export default useFarmAPY;
