"use client";

import { useMemo } from "react";
import { ethers, Contract, MaxUint256 } from "ethers";

import {
  ABIS,
  routerAddress,
  TOKENS,
  MINIMAL_ERC20_ABI,
  APP_CONSTANTS,
} from "@/utils/constants";

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
    return new Contract(routerAddress, ABIS.FSKRouter, provider);
  }, [provider]);

  const routerWrite = useMemo(() => {
    if (!signer) return null;
    return new Contract(routerAddress, ABIS.FSKRouter, signer);
  }, [signer]);

  /* ================= ERC20 Helpers ================= */

  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    try {
      const token = new Contract(
        tokenAddress,
        MINIMAL_ERC20_ABI,
        provider ?? signer
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

    const from = TOKENS[fromToken];
    const to = TOKENS[toToken];

    const directPath = [from, to];
    const viaWBNB = [from, TOKENS.WBNB, to];

    const decimalsIn = await getTokenDecimals(from);
    const amountInParsed = ethers.parseUnits(amountIn, decimalsIn);

    let bestAmountOut = 0n;
    let bestPath = directPath;

    /* ---- Direct Path ---- */
    try {
      const amounts: bigint[] = await routerRead.getAmountsOut(
        amountInParsed,
        directPath
      );
      bestAmountOut = amounts[amounts.length - 1];
    } catch {}

    /* ---- WBNB Path ---- */
    try {
      const amounts: bigint[] = await routerRead.getAmountsOut(
        amountInParsed,
        viaWBNB
      );
      const out = amounts[amounts.length - 1];
      if (out > bestAmountOut) {
        bestAmountOut = out;
        bestPath = viaWBNB;
      }
    } catch {}

    if (bestAmountOut === 0n) {
      throw new Error("Insufficient liquidity");
    }

    return { path: bestPath, amountOut: bestAmountOut };
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

    /* ---- Slippage Protection (basis points) ---- */
    const slippageBps = BigInt(Math.floor(slippagePercent * 100));
    const amountOutMin =
      (amountOut * (10_000n - slippageBps)) / 10_000n;

    /* ---- Token Approval ---- */
    const tokenIn = new Contract(path[0], MINIMAL_ERC20_ABI, signer);
    const owner = await signer.getAddress();

    const allowance: bigint = await tokenIn.allowance(
      owner,
      routerAddress
    );

    if (allowance < amountInParsed) {
      const approveTx = await tokenIn.approve(
        routerAddress,
        MaxUint256
      );
      await approveTx.wait();
    }

    /* ---- Execute Swap ---- */
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
