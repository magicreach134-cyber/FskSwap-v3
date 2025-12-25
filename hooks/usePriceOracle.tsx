"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { ORACLES, ROUTER_ADDRESS, ROUTER_ABI } from "../utils/constants";

/* ======================================================
   TYPES
   ====================================================== */

interface PriceResult {
  price: ethers.BigNumber;
  decimals: number;
  formatted: string;
  source: "chainlink" | "router";
}

interface OracleOptions {
  chainId?: number;
  enabled?: boolean;
  refreshInterval?: number; // ms
}

/* ======================================================
   usePriceOracle
   ====================================================== */

const usePriceOracle = (
  provider: ethers.providers.Web3Provider | null,
  token: string | null,
  options?: OracleOptions
) => {
  const [data, setData] = useState<PriceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timer = useRef<NodeJS.Timeout | null>(null);

  /* ----------------------------------------------------
     Fetch price
     ---------------------------------------------------- */
  const fetchPrice = useCallback(async () => {
    if (!provider || !token || options?.enabled === false) return;

    try {
      setLoading(true);
      setError(null);

      if (options?.chainId) {
        const net = await provider.getNetwork();
        if (net.chainId !== options.chainId) return;
      }

      /* ---------------- Chainlink Oracle ---------------- */
      const oracleAddress = ORACLES[token.toLowerCase()];
      if (oracleAddress) {
        const oracle = new ethers.Contract(
          oracleAddress,
          [
            "function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
            "function decimals() view returns (uint8)"
          ],
          provider
        );

        const [, answer] = await oracle.latestRoundData();
        const decimals: number = await oracle.decimals();

        const formatted = ethers.utils.formatUnits(answer, decimals);

        setData({
          price: answer,
          decimals,
          formatted,
          source: "chainlink"
        });

        return;
      }

      /* ---------------- Router fallback ---------------- */
      const router = new ethers.Contract(
        ROUTER_ADDRESS,
        ROUTER_ABI,
        provider
      );

      const amountIn = ethers.utils.parseUnits("1", 18);

      const path = [
        token,
        await router.WETH()
      ];

      const amounts: ethers.BigNumber[] =
        await router.getAmountsOut(amountIn, path);

      const price = amounts[amounts.length - 1];

      setData({
        price,
        decimals: 18,
        formatted: ethers.utils.formatUnits(price, 18),
        source: "router"
      });
    } catch (e: any) {
      setError(e?.reason || e?.message || "Oracle error");
    } finally {
      setLoading(false);
    }
  }, [provider, token, options?.chainId, options?.enabled]);

  /* ----------------------------------------------------
     Auto refresh
     ---------------------------------------------------- */
  useEffect(() => {
    fetchPrice();

    if (options?.refreshInterval) {
      timer.current = setInterval(fetchPrice, options.refreshInterval);
    }

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [fetchPrice, options?.refreshInterval]);

  return {
    price: data,
    loading,
    error,
    refresh: fetchPrice
  };
};

export default usePriceOracle;
