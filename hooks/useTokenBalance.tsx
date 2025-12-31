"use client";

import { useState, useEffect } from "react";
import { Contract, Signer, BrowserProvider, JsonRpcProvider, formatUnits } from "ethers";

const MINIMAL_ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const useTokenBalance = (
  tokenAddress: string,
  account: string,
  provider: Signer | BrowserProvider | JsonRpcProvider | null,
  fallbackDecimals = 18
) => {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (!provider || !account || !tokenAddress) return;

    let mounted = true;

    const fetchBalance = async () => {
      try {
        const contract = new Contract(tokenAddress, MINIMAL_ERC20_ABI, provider);

        let decimals = fallbackDecimals;
        try {
          decimals = await contract.decimals();
        } catch {}

        const bal: bigint = await contract.balanceOf(account);
        if (mounted) setBalance(formatUnits(bal, decimals));
      } catch (err) {
        console.error("useTokenBalance error:", err);
        if (mounted) setBalance("0");
      }
    };

    fetchBalance();

    return () => { mounted = false; };
  }, [tokenAddress, account, provider, fallbackDecimals]);

  return balance;
};

export default useTokenBalance;
