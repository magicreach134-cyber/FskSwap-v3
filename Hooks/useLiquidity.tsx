// src/hooks/useLiquidity.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKRouterABI, fskRouterAddress } from "../utils/constants";

export const useLiquidity = (signer: ethers.Signer | null) => {
  const [routerContract, setRouterContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (!signer) return;
    setRouterContract(new ethers.Contract(fskRouterAddress, FSKRouterABI, signer));
  }, [signer]);

  const addLiquidity = async (
    tokenA: string,
    tokenB: string,
    amountADesired: string,
    amountBDesired: string,
    to: string
  ) => {
    if (!routerContract) throw new Error("Router not initialized");

    const tx = await routerContract.addLiquidity(
      tokenA,
      tokenB,
      ethers.utils.parseUnits(amountADesired, 18),
      ethers.utils.parseUnits(amountBDesired, 18),
      0, // min amounts for slippage
      0,
      to,
      Math.floor(Date.now() / 1000) + 60 * 20
    );
    return await tx.wait();
  };

  const removeLiquidity = async (
    tokenA: string,
    tokenB: string,
    liquidity: string,
    to: string
  ) => {
    if (!routerContract) throw new Error("Router not initialized");

    const tx = await routerContract.removeLiquidity(
      tokenA,
      tokenB,
      ethers.utils.parseUnits(liquidity, 18),
      0,
      0,
      to,
      Math.floor(Date.now() / 1000) + 60 * 20
    );
    return await tx.wait();
  };

  return { addLiquidity, removeLiquidity };
};
