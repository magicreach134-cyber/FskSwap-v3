"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { fskFlashSwapAddress, fskFlashSwapABI } from "../utils/constants";

export const useFlashSwapEstimate = (signer) => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (signer) {
      setContract(new ethers.Contract(fskFlashSwapAddress, fskFlashSwapABI, signer));
    }
  }, [signer]);

  const estimateProfit = async (tokenBorrow, amount) => {
    if (!contract || !tokenBorrow || !amount) return "0";
    try {
      const profit = await contract.estimateProfit(
        tokenBorrow,
        ethers.utils.parseUnits(amount.toString(), 18)
      );
      return ethers.utils.formatUnits(profit, 18);
    } catch (err) {
      console.error("FlashSwap estimate failed:", err);
      return "0";
    }
  };

  const executeFlashSwap = async (tokenBorrow, amount) => {
    if (!contract) return null;
    try {
      const tx = await contract.executeFlashSwap(
        tokenBorrow,
        ethers.utils.parseUnits(amount.toString(), 18)
      );
      return await tx.wait();
    } catch (err) {
      console.error("FlashSwap execution failed:", err);
      throw err;
    }
  };

  return { estimateProfit, executeFlashSwap };
};
