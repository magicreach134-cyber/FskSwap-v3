// hooks/useTokenPrice.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKEN_ADDRESS_MAP, ABIS, factoryAddress, routerAddress } from "../utils/constants";

/**
 * useTokenPrice Hook
 * Fetches the price of a token in terms of a base token (e.g., WBNB or FSK)
 */
interface UseTokenPriceOptions {
  provider: ethers.providers.Web3Provider;
  tokenAddress: string;
  baseTokenAddress?: string; // Defaults to WBNB
}

const useTokenPrice = ({ provider, tokenAddress, baseTokenAddress }: UseTokenPriceOptions) => {
  const [price, setPrice] = useState<number | null>(null);
  const baseToken = baseTokenAddress || TOKEN_ADDRESS_MAP.WBNB;

  useEffect(() => {
    if (!provider || !tokenAddress) return;

    const fetchPrice = async () => {
      try {
        const router = new ethers.Contract(routerAddress, ABIS.FSKRouter, provider);

        // Path: token → baseToken
        const amountsOut: ethers.BigNumber[] = await router.getAmountsOut(
          ethers.utils.parseUnits("1", 18),
          [tokenAddress, baseToken]
        );

        // Convert to number (considering decimals)
        const tokenPrice = parseFloat(ethers.utils.formatUnits(amountsOut[1], 18));
        setPrice(tokenPrice);
      } catch (err) {
        console.error("useTokenPrice error:", err);
        setPrice(null);
      }
    };

    fetchPrice();
  }, [provider, tokenAddress, baseToken]);

  return { price };
};

export default useTokenPrice;
