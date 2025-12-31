// hooks/useTokenPrice.ts
"use client";

import { useState, useEffect } from "react";
import { Contract, BrowserProvider, Signer, parseUnits, formatUnits } from "ethers";
import { TOKEN_ADDRESS_MAP, ABIS, routerAddress } from "../utils/constants";

/**
 * useTokenPrice Hook
 * Fetches the price of a token in terms of a base token (default: WBNB)
 */
interface UseTokenPriceOptions {
  provider: Signer | BrowserProvider | null;
  tokenAddress: string;
  baseTokenAddress?: string; // Defaults to WBNB
}

const useTokenPrice = ({ provider, tokenAddress, baseTokenAddress }: UseTokenPriceOptions) => {
  const [price, setPrice] = useState<number | null>(null);
  const baseToken = baseTokenAddress || TOKEN_ADDRESS_MAP.WBNB;

  useEffect(() => {
    let mounted = true;
    if (!provider || !tokenAddress) return;

    const fetchPrice = async () => {
      try {
        const router = new Contract(routerAddress, ABIS.FSKRouter, provider);

        // Path: token → baseToken
        const amountsOut: bigint[] = await router.getAmountsOut(
          parseUnits("1", 18),
          [tokenAddress, baseToken]
        );

        const tokenPrice = parseFloat(formatUnits(amountsOut[1], 18));

        if (mounted) setPrice(tokenPrice);
      } catch (err) {
        console.error("useTokenPrice error:", err);
        if (mounted) setPrice(null);
      }
    };

    fetchPrice();

    return () => { mounted = false; };
  }, [provider, tokenAddress, baseToken]);

  return { price };
};

export default useTokenPrice;
