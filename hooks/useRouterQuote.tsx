"use client";

import { ethers } from "ethers";
import IFSKRouterABI from "@/utils/abis/IFSKRouter.json";
import { routerAddress } from "@/utils/constants";

export const getAmountsOut = async (
  provider: ethers.BrowserProvider,
  amountIn: string,
  path: string[],
  decimalsIn = 18
): Promise<string[]> => {
  const contract = new ethers.Contract(
    routerAddress,
    IFSKRouterABI,
    provider
  );

  const parsedAmount = ethers.parseUnits(amountIn, decimalsIn);

  const amounts: bigint[] = await contract.getAmountsOut(
    parsedAmount,
    path
  );

  return amounts.map((a) => a.toString());
};
