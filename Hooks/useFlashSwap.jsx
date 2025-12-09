"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { flashSwapABI, flashSwapAddress } from "../utils/constants";

export const useFlashSwap = (signer) => {
  const [flashSwapContract, setFlashSwapContract] = useState(null);

  useEffect(() => {
    if (signer) {
      setFlashSwapContract(new ethers.Contract(flashSwapAddress, flashSwapABI, signer));
    }
  }, [signer]);

  const estimateProfit = async (tokenBorrow, amount) => {
    if (!flashSwapContract) return;
    const profit = await flashSwapContract.estimateProfit(
      tokenBorrow,
      ethers.utils.parseUnits(amount.toString(), 18)
    );
    return ethers.utils.formatUnits(profit, 18);
  };

  const executeFlashSwap = async (tokenBorrow, amount) => {
    if (!flashSwapContract) return;
    const tx = await flashSwapContract.executeFlashSwap(
      tokenBorrow,
      ethers.utils.parseUnits(amount.toString(), 18)
    );
    return await tx.wait();
  };

  return { estimateProfit, executeFlashSwap };
};
