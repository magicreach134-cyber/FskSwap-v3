"use client";

import { useMemo } from "react";
import { ethers } from "ethers";
import {
  ABIS,
  routerAddress,
  TOKENS,
  MINIMAL_ERC20_ABI,
  APP_CONSTANTS,
} from "../utils/constants";

type SwapParams = {
  amountIn: string;
  amountOutMin: string;
  fromToken: keyof typeof TOKENS;
  toToken: keyof typeof TOKENS;
  to: string;
};

export const useSwap = (
  provider: ethers.providers.Web3Provider | null,
  signer: ethers.Signer | null
) => {
  const routerRead = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(
      routerAddress,
      ABIS.FSKRouter,
      provider
    );
  }, [provider]);

  const routerWrite = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(
      routerAddress,
      ABIS.FSKRouter,
      signer
    );
  }, [signer]);

  const getAmountOut = async (
    amountIn: string,
    fromToken: keyof typeof TOKENS,
    toToken: keyof typeof TOKENS,
    decimalsIn = 18
  ): Promise<string | null> => {
    if (!routerRead) return null;

    const path = [TOKENS[fromToken], TOKENS[toToken]];

    const amounts = await routerRead.getAmountsOut(
      ethers.utils.parseUnits(amountIn, decimalsIn),
      path
    );

    return ethers.utils.formatUnits(
      amounts[amounts.length - 1],
      decimalsIn
    );
  };

  const swapExactTokensForTokens = async ({
    amountIn,
    amountOutMin,
    fromToken,
    toToken,
    to,
  }: SwapParams) => {
    if (!routerWrite || !signer) {
      throw new Error("Wallet not connected");
    }

    const path = [TOKENS[fromToken], TOKENS[toToken]];
    const amountInParsed = ethers.utils.parseUnits(amountIn, 18);
    const amountOutMinParsed = ethers.utils.parseUnits(amountOutMin, 18);

    // --- APPROVAL ---
    const tokenContract = new ethers.Contract(
      TOKENS[fromToken],
      MINIMAL_ERC20_ABI,
      signer
    );

    const allowance = await tokenContract.allowance(
      await signer.getAddress(),
      routerAddress
    );

    if (allowance.lt(amountInParsed)) {
      const approveTx = await tokenContract.approve(
        routerAddress,
        ethers.constants.MaxUint256
      );
      await approveTx.wait();
    }

    const deadline =
      Math.floor(Date.now() / 1000) +
      APP_CONSTANTS.DEFAULT_DEADLINE_SECONDS;

    const tx = await routerWrite.swapExactTokensForTokens(
      amountInParsed,
      amountOutMinParsed,
      path,
      to,
      deadline
    );

    return await tx.wait();
  };

  return {
    getAmountOut,
    swapExactTokensForTokens,
  };
};
