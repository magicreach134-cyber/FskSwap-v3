"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useLPBalance = (lpTokenAddress, userAddress, provider) => {
  const [balance, setBalance] = useState(ethers.BigNumber.from(0));
  const [decimals, setDecimals] = useState(18);

  useEffect(() => {
    if (!lpTokenAddress || !userAddress || !provider) return;

    const fetchBalance = async () => {
      try {
        const abi = [
          "function balanceOf(address) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ];
        const contract = new ethers.Contract(lpTokenAddress, abi, provider);
        const [rawBalance, tokenDecimals] = await Promise.all([
          contract.balanceOf(userAddress),
          contract.decimals(),
        ]);
        setBalance(rawBalance);
        setDecimals(tokenDecimals);
      } catch (err) {
        console.error("useLPBalance error:", err);
      }
    };

    fetchBalance();
  }, [lpTokenAddress, userAddress, provider]);

  const formattedBalance = parseFloat(ethers.utils.formatUnits(balance, decimals));

  return { balance: formattedBalance, rawBalance: balance, decimals };
};

export default useLPBalance;
