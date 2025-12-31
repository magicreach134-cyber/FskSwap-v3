"use client";

import { useEffect, useState } from "react";
import {
  ethers,
  Contract,
  Signer,
  BrowserProvider,
  JsonRpcProvider
} from "ethers";

import FskFlashSwapABI from "@/utils/abis/FskFlashSwap.json";
import { CONTRACTS, DEFAULT_BNB_RPC } from "@/utils/constants";

export interface EstimateResult {
  maxProfit: string;
  bestRouter: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const useFlashSwap = (signer?: Signer | null) => {
  const [contract, setContract] = useState<Contract | null>(null);

  /* ---------- INIT CONTRACT ---------- */
  useEffect(() => {
    let provider;

    if (signer) {
      provider = signer;
    } else {
      provider = new JsonRpcProvider(DEFAULT_BNB_RPC);
    }

    const instance = new Contract(
      CONTRACTS.FskFlashSwap,
      FskFlashSwapABI,
      provider
    );

    setContract(instance);
  }, [signer]);

  /* ---------- ESTIMATE BEST ROUTER ---------- */
  const estimateBestRouter = async (
    amount: string,
    routers: string[],
    path: string[]
  ): Promise<EstimateResult> => {
    if (!contract || !amount || routers.length === 0 || path.length === 0) {
      return { maxProfit: "0", bestRouter: ZERO_ADDRESS };
    }

    try {
      const parsedAmount = ethers.parseUnits(amount, 18);

      const result = await contract.estimateBestRouter(
        parsedAmount,
        routers,
        path
      );

      const profitBN = result[0] as bigint;
      const bestRouter = result[1] as string;

      return {
        maxProfit: ethers.formatUnits(profitBN, 18),
        bestRouter
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
    if (!contract || !signer) {
      throw new Error("FlashSwap contract not connected to signer");
    }

    const parsedAmount = ethers.parseUnits(amount, 18);

    const tx = await contract
      .connect(signer)
      .executeFlashSwap(
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
    getPrice
  };
};

export default useFlashSwap;
