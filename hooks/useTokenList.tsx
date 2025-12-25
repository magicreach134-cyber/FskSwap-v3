// hooks/useTokenList.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { TOKEN_LIST, TOKEN_ADDRESS_MAP } from "../utils/constants";

export interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  balance?: string; // optional, populated if provider & user given
}

interface UseTokenListOptions {
  provider?: ethers.providers.Web3Provider;
  userAddress?: string;
}

/**
 * useTokenList Hook
 * Provides full token list and optionally user balances
 */
const useTokenList = ({ provider, userAddress }: UseTokenListOptions = {}) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  useEffect(() => {
    const loadTokens = async () => {
      const tokenData: TokenInfo[] = [...TOKEN_LIST];

      if (provider && userAddress) {
        for (let i = 0; i < tokenData.length; i++) {
          try {
            const tokenContract = new ethers.Contract(
              tokenData[i].address,
              ["function balanceOf(address) view returns (uint256)"],
              provider
            );
            const rawBalance: ethers.BigNumber = await tokenContract.balanceOf(userAddress);
            tokenData[i].balance = ethers.utils.formatUnits(rawBalance, tokenData[i].decimals);
          } catch (err) {
            console.error(`Failed to fetch balance for ${tokenData[i].symbol}:`, err);
            tokenData[i].balance = "0";
          }
        }
      }

      setTokens(tokenData);
    };

    loadTokens();
  }, [provider, userAddress]);

  const getTokenBySymbol = (symbol: string) => {
    return tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
  };

  const getTokenByAddress = (address: string) => {
    return tokens.find((t) => t.address.toLowerCase() === address.toLowerCase());
  };

  return { tokens, getTokenBySymbol, getTokenByAddress };
};

export default useTokenList;
