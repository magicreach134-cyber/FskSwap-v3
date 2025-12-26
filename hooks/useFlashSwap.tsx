"use client";

import { useEffect, useState } from "react";
import { ethers, Contract } from "ethers";

import FskFlashSwapABI from "@/utils/abis/FskFlashSwap.json";
import { CONTRACTS } from "@/utils/constants";

export interface EstimateResult {
  maxProfit: string;
  bestRouter: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const useFlashSwap = (signer?: ethers.Signer | null) => {
  const [contract, setContract] = useState<Contract | null>(null);

  /* ---------- INIT CONTRACT ---------- */
  useEffect(() => {
    if (!signer) {
      setContract(null);
      return;
    }

    const instance = new Contract(CONTRACTS.FskFlashSwap, FskFlashSwapABI, signer);
    setContract(instance);
  }, [signer]);

  /* ---------- ESTIMATE BEST ROUTER ---------- */
  const estimateBestRouter = async (
    amount: string,
    routers: string[],
    path: string[]
  ): Promise<EstimateResult> => {
    if (!contract || !amount) {
      return { maxProfit: "0", bestRouter: ZERO_ADDRESS };
    }

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);

      const [profitBN, bestRouter]: [bigint, string] =
        await contract.estimateBestRouter(parsedAmount, routers, path);

      return {
        maxProfit: ethers.formatUnits(profitBN, 18),
        bestRouter,
      };
    } catch (err) {
      console.error("estimateBestRouter failed:", err);
      return { maxProfit: "0", bestRouter: ZERO_ADDRESS };
    }
  };

  /* ---------- EXECUTE FLASH SWAP ---------- */
  const executeFlashSwap = async (
    tokenBorrow: string,
    amount: string,
    tokenTarget: string,
    routers: string[],
    path: string[]
  ) => {
    if (!contract) throw new Error("FlashSwap contract not initialized");

    const parsedAmount = ethers.parseUnits(amount, 18);

    const tx = await contract.executeFlashSwap(
      tokenBorrow,
      parsedAmount,
      tokenTarget,
      routers,
      path
    );

    return await tx.wait();
  };

  /* ---------- GET PRICE ---------- */
  const getPrice = async (token: string): Promise<string> => {
    if (!contract) return "0";

    try {
      const price: bigint = await contract.getPrice(token);
      return ethers.formatUnits(price, 18);
    } catch (err) {
      console.error("getPrice failed:", err);
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
