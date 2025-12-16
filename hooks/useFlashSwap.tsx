"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import FskFlashSwapABI from "@/utils/abis/FskFlashSwap.json";
import { FSKFlashSwap } from "@/utils/constants";

export interface EstimateResult {
  maxProfit: string;
  bestRouter: string;
}

const useFlashSwap = (signer?: ethers.Signer) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (!signer) return;

    const instance = new ethers.Contract(
      FSKFlashSwap,
      FskFlashSwapABI,
      signer
    );

    setContract(instance);
  }, [signer]);

  /**
   * Estimate best router and profit BEFORE execution
   */
  const estimateBestRouter = async (
    amount: string,
    routers: string[],
    path: string[]
  ): Promise<EstimateResult> => {
    if (!contract) {
      return { maxProfit: "0", bestRouter: ethers.constants.AddressZero };
    }

    try {
      const parsedAmount = ethers.utils.parseUnits(amount, 18);

      const result = await contract.estimateBestRouter(
        parsedAmount,
        routers,
        path
      );

      return {
        maxProfit: ethers.utils.formatUnits(result.maxProfit, 18),
        bestRouter: result.bestRouter,
      };
    } catch (error) {
      console.error("estimateBestRouter failed:", error);
      return { maxProfit: "0", bestRouter: ethers.constants.AddressZero };
    }
  };

  /**
   * Execute flash swap (ONLY after estimation)
   */
  const executeFlashSwap = async (
    tokenBorrow: string,
    amount: string,
    tokenTarget: string,
    routers: string[],
    path: string[]
  ) => {
    if (!contract) {
      throw new Error("FlashSwap contract not initialized");
    }

    const parsedAmount = ethers.utils.parseUnits(amount, 18);

    const tx = await contract.executeFlashSwap(
      tokenBorrow,
      parsedAmount,
      tokenTarget,
      routers,
      path
    );

    return await tx.wait();
  };

  /**
   * Read token price from on-chain feed
   */
  const getPrice = async (token: string): Promise<string> => {
    if (!contract) return "0";

    try {
      const price = await contract.getPrice(token);
      return ethers.utils.formatUnits(price, 18);
    } catch (error) {
      console.error("getPrice failed:", error);
      return "0";
    }
  };

  return {
    estimateBestRouter,
    executeFlashSwap,
    getPrice,
  };
};

export default useFlashSwap;
