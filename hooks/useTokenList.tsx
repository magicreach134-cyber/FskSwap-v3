// hooks/useTokenList.ts
"use client";

import { useState, useEffect } from "react";
import { Contract, BrowserProvider, Signer, JsonRpcProvider, formatUnits } from "ethers";
import { TOKEN_LIST } from "../utils/constants";

export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  balance?: string; // optional, populated if provider & user given
}

interface UseTokenListOptions {
  provider?: Signer | BrowserProvider | JsonRpcProvider | null;
  userAddress?: string;
}

/**
 * useTokenList Hook
 * Provides token list and optionally user balances
 */
const useTokenList = ({ provider, userAddress }: UseTokenListOptions = {}) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadTokens = async () => {
      const tokenData: TokenInfo[] = TOKEN_LIST.map((t) => ({ ...t }));

      if (provider && userAddress) {
        for (let i = 0; i < tokenData.length; i++) {
          try {
            const tokenContract = new Contract(
              tokenData[i].address,
              ["function balanceOf(address) view returns (uint256)"],
              provider
            );
            const rawBalance: bigint = await tokenContract.balanceOf(userAddress);
            tokenData[i].balance = formatUnits(rawBalance, tokenData[i].decimals);
          } catch (err) {
            console.error(`Failed to fetch balance for ${tokenData[i].symbol}:`, err);
            tokenData[i].balance = "0";
          }
        }
      }

      if (mounted) setTokens(tokenData);
    };

    loadTokens();

    return () => { mounted = false; };
  }, [provider, userAddress]);

  const getTokenBySymbol = (symbol: string) =>
    tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());

  const getTokenByAddress = (address: string) =>
    tokens.find((t) => t.address.toLowerCase() === address.toLowerCase());

  return { tokens, getTokenBySymbol, getTokenByAddress };
};

export default useTokenList;
