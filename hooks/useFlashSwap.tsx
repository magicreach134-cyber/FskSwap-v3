"use client";

import { useEffect, useState } from "react";
import { Contract, BrowserProvider, JsonRpcProvider, parseUnits, formatUnits } from "ethers";

import FskFlashSwapABI from "@/utils/abis/FskFlashSwap.json";
import { CONTRACTS, DEFAULT_BNB_RPC } from "@/utils/constants";

export interface EstimateResult {
  maxProfit: string;
  bestRouter: string;
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const useFlashSwap = (provider: BrowserProvider | null) => {
  const [contract, setContract] = useState<Contract | null>(null);

  /* ---------- INIT CONTRACT ---------- */
  useEffect(() => {
    const init = async () => {
      try {
        const readProvider = provider ?? new JsonRpcProvider(DEFAULT_BNB_RPC);
        const instance = new Contract(CONTRACTS.FskFlashSwap, FskFlashSwapABI, readProvider);
        setContract(instance);
      } catch (err) {
        console.error("Failed to initialize flash swap contract:", err);
        setContract(null);
      }
    };

    init();
  }, [provider]);

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
      const parsedAmount = parseUnits(amount, 18);
      const [profit, router] = await contract.estimateBestRouter(parsedAmount, routers, path);
      return {
        maxProfit: formatUnits(profit as bigint, 18),
        bestRouter: router as string,
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
    if (!contract || !provider) throw new Error("Wallet not connected");

    const signer = await provider.getSigner();
    const parsedAmount = parseUnits(amount, 18);

    const tx = await contract.connect(signer).executeFlashSwap(
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
      return formatUnits(price, 18);
    } catch (err) {
      console.error("getPrice failed:", err);
      return "0";
    }
  };

  return { estimateBestRouter, executeFlashSwap, getPrice };
};

export default useFlashSwap;
