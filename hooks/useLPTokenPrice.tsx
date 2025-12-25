// hooks/useLPTokenPrice.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ABIS } from "../utils/constants";

export interface LPPriceData {
  lpAddress: string;
  lpPriceUSD: number;
  reserve0: number;
  reserve1: number;
  token0: string;
  token1: string;
}

interface UseLPTokenPriceProps {
  provider: ethers.providers.Web3Provider;
  lpAddresses: string[];
  tokenPricesUSD: Record<string, number>; // mapping of token symbol => USD price
}

const useLPTokenPrice = ({
  provider,
  lpAddresses,
  tokenPricesUSD,
}: UseLPTokenPriceProps) => {
  const [lpData, setLpData] = useState<LPPriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!provider || !lpAddresses.length) return;

    const loadLPPrices = async () => {
      setLoading(true);
      try {
        const data: LPPriceData[] = [];

        for (const lpAddress of lpAddresses) {
          const lpContract = new ethers.Contract(lpAddress, ABIS.FSKSwapLPStaking, provider);

          // Fetch reserves and token addresses
          const [reservesRaw, token0Addr, token1Addr] = await Promise.all([
            lpContract.getReserves(),
            lpContract.token0(),
            lpContract.token1(),
          ]);

          // Fetch decimals for each token
          const token0Contract = new ethers.Contract(token0Addr, ABIS.MINIMAL_ERC20_ABI, provider);
          const token1Contract = new ethers.Contract(token1Addr, ABIS.MINIMAL_ERC20_ABI, provider);

          const [dec0, dec1, symbol0, symbol1] = await Promise.all([
            token0Contract.decimals(),
            token1Contract.decimals(),
            token0Contract.symbol(),
            token1Contract.symbol(),
          ]);

          // Format reserves
          const reserve0 = parseFloat(ethers.utils.formatUnits(reservesRaw._reserve0, dec0));
          const reserve1 = parseFloat(ethers.utils.formatUnits(reservesRaw._reserve1, dec1));

          // Compute LP price in USD
          const price0 = tokenPricesUSD[symbol0] || 0;
          const price1 = tokenPricesUSD[symbol1] || 0;
          const totalValueUSD = reserve0 * price0 + reserve1 * price1;

          const totalSupply = parseFloat(
            ethers.utils.formatUnits(await lpContract.totalSupply(), 18)
          );

          const lpPriceUSD = totalSupply ? totalValueUSD / totalSupply : 0;

          data.push({
            lpAddress,
            lpPriceUSD,
            reserve0,
            reserve1,
            token0: symbol0,
            token1: symbol1,
          });
        }

        setLpData(data);
      } catch (err) {
        console.error("useLPTokenPrice error:", err);
        setLpData([]);
      } finally {
        setLoading(false);
      }
    };

    loadLPPrices();
  }, [provider, lpAddresses, tokenPricesUSD]);

  return { lpData, loading };
};

export default useLPTokenPrice;
