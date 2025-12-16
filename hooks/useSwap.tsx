"use client";

import { useMemo } from "react";
import { ethers, BigNumber } from "ethers";
import {
  ABIS,
  routerAddress,
  TOKENS,
  MINIMAL_ERC20_ABI,
  APP_CONSTANTS,
} from "../utils/constants";

type SwapParams = {
  amountIn: string;
  slippagePercent?: number;
  fromToken: keyof typeof TOKENS;
  toToken: keyof typeof TOKENS;
  to: string;
};

export const useSwap = (provider: ethers.BrowserProvider | null, signer: ethers.Signer | null) => {
  const routerRead = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(routerAddress, ABIS.FSKRouter, provider);
  }, [provider]);

  const routerWrite = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(routerAddress, ABIS.FSKRouter, signer);
  }, [signer]);

  // Get token decimals dynamically
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    if (!signer) return 18;
    try {
      const token = new ethers.Contract(tokenAddress, MINIMAL_ERC20_ABI, signer);
      return await token.decimals();
    } catch {
      return 18;
    }
  };

  // Estimate output amount
  const getAmountOut = async (
    amountIn: string,
    fromToken: keyof typeof TOKENS,
    toToken: keyof typeof TOKENS
  ): Promise<string | null> => {
    if (!routerRead) return null;

    const path = [TOKENS[fromToken], TOKENS[toToken]];
    const decimalsIn = await getTokenDecimals(path[0]);
    const decimalsOut = await getTokenDecimals(path[1]);

    const amounts = await routerRead.getAmountsOut(
      ethers.utils.parseUnits(amountIn, decimalsIn),
      path
    );

    return ethers.utils.formatUnits(amounts[amounts.length - 1], decimalsOut);
  };

  // Swap tokens with optional slippage
  const swapExactTokensForTokens = async ({
    amountIn,
    slippagePercent = APP_CONSTANTS.DEFAULT_SLIPPAGE_PERCENT,
    fromToken,
    toToken,
    to,
  }: SwapParams) => {
    if (!routerWrite || !signer) throw new Error("Wallet not connected");

    const path = [TOKENS[fromToken], TOKENS[toToken]];
    const decimalsIn = await getTokenDecimals(path[0]);
    const decimalsOut = await getTokenDecimals(path[1]);

    const amountInParsed = ethers.utils.parseUnits(amountIn, decimalsIn);

    // Get estimated output
    const amountsOut = await routerRead!.getAmountsOut(amountInParsed, path);
    const amountOutEstimated = amountsOut[amountsOut.length - 1] as BigNumber;

    // Apply slippage
    const amountOutMin = amountOutEstimated
      .mul(10000 - Math.floor(slippagePercent * 100))
      .div(10000);

    // Approve if needed
    const tokenContract = new ethers.Contract(path[0], MINIMAL_ERC20_ABI, signer);
    const allowance = await tokenContract.allowance(await signer.getAddress(), routerAddress);
    if (allowance.lt(amountInParsed)) {
      const approveTx = await tokenContract.approve(routerAddress, ethers.constants.MaxUint256);
      await approveTx.wait();
    }

    const deadline = Math.floor(Date.now() / 1000) + APP_CONSTANTS.DEFAULT_DEADLINE_SECONDS;

    const tx = await routerWrite.swapExactTokensForTokens(
      amountInParsed,
      amountOutMin,
      path,
      to,
      deadline
    );

    return await tx.wait();
  };

  return { getAmountOut, swapExactTokensForTokens };
};
