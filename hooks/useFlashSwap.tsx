// hooks/useFlashSwap.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FskFlashSwapABI from "../utils/abis/FskFlashSwap.json";
import { FSKFlashSwap } from "../utils/constants";

const useFlashSwap = (signer?: ethers.Signer) => {
  const [flashSwapContract, setFlashSwapContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      try {
        const contract = new ethers.Contract(FSKFlashSwap, FskFlashSwapABI, signer);
        setFlashSwapContract(contract);
      } catch (err) {
        console.error("Failed to initialize FlashSwap contract:", err);
      }
    }
  }, [signer]);

  // Estimate the best router and profit for a swap
  const estimateBestRouter = async (
    amount: string,
    routers: string[],
    path: string[]
  ): Promise<{ maxProfit: number; bestRouter: string }> => {
    if (!flashSwapContract) return { maxProfit: 0, bestRouter: "" };
    try {
      const [profitBN, bestRouter]: [ethers.BigNumber, string] =
        await flashSwapContract.estimateBestRouter(
          ethers.utils.parseUnits(amount, 18),
          routers,
          path
        );
      return { maxProfit: parseFloat(ethers.utils.formatUnits(profitBN, 18)), bestRouter };
    } catch (err) {
      console.error("estimateBestRouter error:", err);
      return { maxProfit: 0, bestRouter: "" };
    }
  };

  // Execute a flash swap
  const executeFlashSwap = async (
    tokenBorrow: string,
    amount: string,
    tokenTarget: string,
    routers: string[],
    path: string[]
  ) => {
    if (!flashSwapContract) throw new Error("FlashSwap contract not initialized");
    try {
      const tx = await flashSwapContract.executeFlashSwap(
        tokenBorrow,
        ethers.utils.parseUnits(amount, 18),
        tokenTarget,
        routers,
        path
      );
      return await tx.wait();
    } catch (err) {
      console.error("executeFlashSwap error:", err);
      throw err;
    }
  };

  // Get price of a token
  const getPrice = async (token: string): Promise<number> => {
    if (!flashSwapContract) return 0;
    try {
      const priceBN: ethers.BigNumber = await flashSwapContract.getPrice(token);
      return parseFloat(ethers.utils.formatUnits(priceBN, 18));
    } catch (err) {
      console.error("getPrice error:", err);
      return 0;
    }
  };

  return {
    flashSwapContract,
    estimateBestRouter,
    executeFlashSwap,
    getPrice,
  };
};

export default useFlashSwap;
