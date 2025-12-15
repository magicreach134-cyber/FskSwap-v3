// hooks/useRouter.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import IFSKRouterABI from "../utils/abis/IFSKRouter.json";
import { IFSKRouter } from "../utils/constants";

const useRouter = (signer?: ethers.Signer) => {
  const [routerContract, setRouterContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      try {
        const contract = new ethers.Contract(IFSKRouter, IFSKRouterABI, signer);
        setRouterContract(contract);
      } catch (err) {
        console.error("Failed to initialize Router contract:", err);
      }
    }
  }, [signer]);

  // Get expected output amounts for a swap
  const getAmountsOut = async (amountIn: string, path: string[]) => {
    if (!routerContract) return [];
    try {
      const amounts: ethers.BigNumber[] = await routerContract.getAmountsOut(
        ethers.utils.parseUnits(amountIn, 18),
        path
      );
      return amounts.map((bn) => parseFloat(ethers.utils.formatUnits(bn, 18)));
    } catch (err) {
      console.error("getAmountsOut error:", err);
      return [];
    }
  };

  // Swap exact tokens for tokens
  const swapExactTokensForTokens = async (
    amountIn: string,
    amountOutMin: string,
    path: string[],
    to: string,
    deadline: number
  ) => {
    if (!routerContract) throw new Error("Router contract not initialized");
    try {
      const tx = await routerContract.swapExactTokensForTokens(
        ethers.utils.parseUnits(amountIn, 18),
        ethers.utils.parseUnits(amountOutMin, 18),
        path,
        to,
        deadline
      );
      return await tx.wait();
    } catch (err) {
      console.error("swapExactTokensForTokens error:", err);
      throw err;
    }
  };

  // Add liquidity
  const addLiquidity = async (
    tokenA: string,
    tokenB: string,
    amountADesired: string,
    amountBDesired: string,
    amountAMin: string,
    amountBMin: string,
    to: string,
    deadline: number
  ) => {
    if (!routerContract) throw new Error("Router contract not initialized");
    try {
      const tx = await routerContract.addLiquidity(
        tokenA,
        tokenB,
        ethers.utils.parseUnits(amountADesired, 18),
        ethers.utils.parseUnits(amountBDesired, 18),
        ethers.utils.parseUnits(amountAMin, 18),
        ethers.utils.parseUnits(amountBMin, 18),
        to,
        deadline
      );
      return await tx.wait();
    } catch (err) {
      console.error("addLiquidity error:", err);
      throw err;
    }
  };

  return { routerContract, getAmountsOut, swapExactTokensForTokens, addLiquidity };
};

export default useRouter;
