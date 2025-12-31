"use client";

import { useState, useEffect } from "react";
import { Contract, Signer, BrowserProvider, parseUnits, formatUnits, JsonRpcProvider } from "ethers";

const MINIMAL_ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)"
];

const useTokenBalance = (
  tokenAddress: string,
  account: string,
  provider: Signer | BrowserProvider | JsonRpcProvider | null,
  decimals = 18
) => {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (!provider || !account || !tokenAddress) return;

    const fetchBalance = async () => {
      try {
        const contract = new Contract(tokenAddress, MINIMAL_ERC20_ABI, provider);
        const bal: bigint = await contract.balanceOf(account);
        setBalance(formatUnits(bal, decimals));
      } catch (err) {
        console.error("useTokenBalance error:", err);
        setBalance("0");
      }
    };

    fetchBalance();
  }, [tokenAddress, account, provider, decimals]);

  return balance;
};

export default useTokenBalance;
