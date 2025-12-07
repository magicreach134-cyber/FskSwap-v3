"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKRouterABI, fskRouterAddress } from "../utils/constants";

const useSwap = (signer) => {
  const [routerContract, setRouterContract] = useState(null);

  useEffect(() => {
    if (signer) {
      try {
        const router = new ethers.Contract(fskRouterAddress, FSKRouterABI, signer);
        setRouterContract(router);
      } catch (err) {
        console.error("Failed to initialize router contract:", err);
      }
    }
  }, [signer]);

  const getAmountOut = async (amountIn, path, decimals = 18) => {
    if (!routerContract) return null;
    try {
      const amountOut = await routerContract.getAmountsOut(
        ethers.utils.parseUnits(amountIn.toString(), decimals),
        path
      );
      return ethers.utils.formatUnits(amountOut[amountOut.length - 1], decimals);
    } catch (err) {
      console.error("getAmountOut error:", err);
      return null;
    }
  };

  const swap = async (amountIn, amountOutMin, path, to, decimals = 18) => {
    if (!routerContract) throw new Error("Router contract not initialized");
    try {
      const tx = await routerContract.swapExactTokensForTokens(
        ethers.utils.parseUnits(amountIn.toString(), decimals),
        ethers.utils.parseUnits(amountOutMin.toString(), decimals),
        path,
        to,
        Math.floor(Date.now() / 1000) + 60 * 20 // 20 min deadline
      );
      return await tx.wait();
    } catch (err) {
      console.error("Swap transaction failed:", err);
      throw err;
    }
  };

  return { routerContract, getAmountOut, swap };
};

export default useSwap;
