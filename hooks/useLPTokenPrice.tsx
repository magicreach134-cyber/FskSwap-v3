// hooks/useLPTokenPrice.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ABIS, TOKEN_ADDRESS_MAP } from "../utils/constants";

interface LPPriceInfo {
  lpAddress: string;
  lpName: string;
  lpSymbol: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  lpPriceUSD: number;
}

interface TokenPriceMap {
  [symbol: string]: number;
}

/**
 * Calculates LP token USD price from reserves and token prices.
 */
const useLPTokenPrice = (
  provider: ethers.providers.Web3Provider,
  lpAddresses: string[],
  tokenPrices: TokenPriceMap
) => {
  const [lpData, setLpData] = useState<LPPriceInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!provider || lpAddresses.length === 0) return;

    const fetchLPPrices = async () => {
      try {
        setLoading(true);

        const data: LPPriceInfo[] = [];

        for (const lpAddress of lpAddresses) {
          const lp = new ethers.Contract(
            lpAddress,
            [
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function totalSupply() view returns (uint256)",
              "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
              "function token0() view returns (address)",
              "function token1() view returns (address)",
            ],
            provider
          );

          const [lpName, lpSymbol, totalSupplyRaw, reserves, token0Addr, token1Addr] =
            await Promise.all([
              lp.name(),
              lp.symbol(),
              lp.totalSupply(),
              lp.getReserves(),
              lp.token0(),
              lp.token1(),
            ]);

          const token0Symbol = Object.keys(TOKEN_ADDRESS_MAP).find(
            (k) => TOKEN_ADDRESS_MAP[k] === token0Addr
          ) || "UNKNOWN";

          const token1Symbol = Object.keys(TOKEN_ADDRESS_MAP).find(
            (k) => TOKEN_ADDRESS_MAP[k] === token1Addr
          ) || "UNKNOWN";

          const reserve0 = parseFloat(ethers.utils.formatUnits(reserves.reserve0, 18));
          const reserve1 = parseFloat(ethers.utils.formatUnits(reserves.reserve1, 18));

          // LP token USD price = total value of reserves / totalSupply
          const totalValueUSD =
            (reserve0 * (tokenPrices[token0Symbol] || 0)) +
            (reserve1 * (tokenPrices[token1Symbol] || 0));

          const totalSupply = parseFloat(ethers.utils.formatUnits(totalSupplyRaw, 18));
          const lpPriceUSD = totalSupply > 0 ? totalValueUSD / totalSupply : 0;

          data.push({
            lpAddress,
            lpName,
            lpSymbol,
            token0: token0Symbol,
            token1: token1Symbol,
            reserve0: reserve0.toString(),
            reserve1: reserve1.toString(),
            totalSupply: totalSupply.toString(),
            lpPriceUSD,
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

    fetchLPPrices();
  }, [provider, lpAddresses, tokenPrices]);

  return { lpData, loading };
};

export default useLPTokenPrice;
