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

type TokenKey = keyof typeof TOKENS;

type SwapParams = {
  amountIn: string;
  fromToken: TokenKey;
  toToken: TokenKey;
  to: string;
  slippagePercent?: number;
};

export const useSwap = (
  provider: ethers.BrowserProvider | null,
  signer: ethers.Signer | null
) => {
  /* ================= Router Instances ================= */

  const routerRead = useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(routerAddress, ABIS.FSKRouter, provider);
  }, [provider]);

  const routerWrite = useMemo(() => {
    if (!signer) return null;
    return new ethers.Contract(routerAddress, ABIS.FSKRouter, signer);
  }, [signer]);

  /* ================= ERC20 Helpers ================= */

  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    if (!provider) return 18;
    try {
      const token = new ethers.Contract(
        tokenAddress,
        MINIMAL_ERC20_ABI,
        provider
      );
      return Number(await token.decimals());
    } catch {
      return 18;
    }
  };

  /* ================= Path Finder ================= */

  const findBestPath = async (
    fromToken: TokenKey,
    toToken: TokenKey,
    amountIn: string
  ): Promise<{ path: string[]; amountOut: bigint }> => {
    if (!routerRead) throw new Error("Router not ready");

    const directPath = [TOKENS[fromToken], TOKENS[toToken]];
    const wbnbPath = [TOKENS[fromToken], TOKENS.WBNB, TOKENS[toToken]];

    const decimalsIn = await getTokenDecimals(TOKENS[fromToken]);
    const amountInParsed = ethers.parseUnits(amountIn, decimalsIn);

    let bestOut: bigint = 0n;
    let bestPath: string[] = directPath;

    // Direct path
    try {
      const amounts = await routerRead.getAmountsOut(
        amountInParsed,
        directPath
      );
      const out = amounts[amounts.length - 1] as bigint;
      if (out > bestOut) {
        bestOut = out;
        bestPath = directPath;
      }
    } catch {}

    // Via WBNB
    try {
      const amounts = await routerRead.getAmountsOut(
        amountInParsed,
        wbnbPath
      );
      const out = amounts[amounts.length - 1] as bigint;
      if (out > bestOut) {
        bestOut = out;
        bestPath = wbnbPath;
      }
    } catch {}

    if (bestOut === 0n) {
      throw new Error("No liquidity for this pair");
    }

    return { path: bestPath, amountOut: bestOut };
  };

  /* ================= Quote ================= */

  const getAmountOut = async (
    fromToken: TokenKey,
    toToken: TokenKey,
    amountIn: string
  ): Promise<string> => {
    const { amountOut } = await findBestPath(fromToken, toToken, amountIn);
    const decimalsOut = await getTokenDecimals(TOKENS[toToken]);
    return ethers.formatUnits(amountOut, decimalsOut);
  };

  /* ================= Swap ================= */

  const swapExactTokensForTokens = async ({
    amountIn,
    fromToken,
    toToken,
    to,
    slippagePercent = APP_CONSTANTS.DEFAULT_SLIPPAGE_PERCENT,
  }: SwapParams) => {
    if (!routerWrite || !signer) {
      throw new Error("Wallet not connected");
    }

    const { path, amountOut } = await findBestPath(
      fromToken,
      toToken,
      amountIn
    );

    const decimalsIn = await getTokenDecimals(path[0]);
    const amountInParsed = ethers.parseUnits(amountIn, decimalsIn);

    // Slippage protection
    const slippageBps = BigInt(Math.floor(slippagePercent * 100));
    const amountOutMin =
      (amountOut * (10000n - slippageBps)) / 10000n;

    /* -------- Approve -------- */

    const token = new ethers.Contract(
      path[0],
      MINIMAL_ERC20_ABI,
      signer
    );

    const owner = await signer.getAddress();
    const allowance: bigint = await token.allowance(owner, routerAddress);

    if (allowance < amountInParsed) {
      const approveTx = await token.approve(
        routerAddress,
        ethers.MaxUint256
      );
      await approveTx.wait();
    }

    /* -------- Swap -------- */

    const deadline =
      Math.floor(Date.now() / 1000) +
      APP_CONSTANTS.DEFAULT_DEADLINE_SECONDS;

    const tx = await routerWrite.swapExactTokensForTokens(
      amountInParsed,
      amountOutMin,
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
