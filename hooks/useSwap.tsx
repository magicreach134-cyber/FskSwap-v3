"use client";

import { useMemo } from "react";
import {
  Contract,
  BrowserProvider,
  JsonRpcProvider,
  parseUnits,
  formatUnits,
  MaxUint256,
} from "ethers";

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

const DEFAULT_BNB_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545";

export const useSwap = (provider: BrowserProvider | null) => {
  /* ================= READ PROVIDER ================= */
  const readProvider = useMemo(
    () => new JsonRpcProvider(DEFAULT_BNB_RPC),
    []
  );

  /* ================= READ ROUTER ================= */
  const routerRead = useMemo(() => {
    return new Contract(routerAddress, ABIS.FSKRouter, readProvider);
  }, [readProvider]);

  /* ================= ERC20 HELPERS ================= */
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    try {
      const token = new Contract(
        tokenAddress,
        MINIMAL_ERC20_ABI,
        readProvider
      );
      return Number(await token.decimals());
    } catch {
      return 18;
    }
  };

  /* ================= PATH FINDER ================= */
  const findBestPath = async (
    fromToken: TokenKey,
    toToken: TokenKey,
    amountIn: string
  ): Promise<{ path: string[]; amountOut: bigint }> => {
    const from = TOKENS[fromToken];
    const to = TOKENS[toToken];

    const directPath = [from, to];
    const wbnbPath = [from, TOKENS.WBNB, to];

    const decimalsIn = await getTokenDecimals(from);
    const amountInParsed = parseUnits(amountIn, decimalsIn);

    let bestAmountOut = 0n;
    let bestPath = directPath;

    try {
      const out = await routerRead.getAmountsOut(amountInParsed, directPath);
      bestAmountOut = out[out.length - 1];
    } catch {}

    try {
      const out = await routerRead.getAmountsOut(amountInParsed, wbnbPath);
      const candidate = out[out.length - 1];
      if (candidate > bestAmountOut) {
        bestAmountOut = candidate;
        bestPath = wbnbPath;
      }
    } catch {}

    if (bestAmountOut === 0n) {
      throw new Error("Insufficient liquidity");
    }

    return { path: bestPath, amountOut: bestAmountOut };
  };

  /* ================= QUOTE ================= */
  const getAmountOut = async (
    fromToken: TokenKey,
    toToken: TokenKey,
    amountIn: string
  ): Promise<string> => {
    const { amountOut } = await findBestPath(fromToken, toToken, amountIn);
    const decimalsOut = await getTokenDecimals(TOKENS[toToken]);
    return formatUnits(amountOut, decimalsOut);
  };

  /* ================= SWAP ================= */
  const swapExactTokensForTokens = async ({
    amountIn,
    fromToken,
    toToken,
    to,
    slippagePercent = APP_CONSTANTS.DEFAULT_SLIPPAGE_PERCENT,
  }: SwapParams) => {
    if (!provider) throw new Error("Wallet not connected");

    const signer = await provider.getSigner();
    const router = new Contract(routerAddress, ABIS.FSKRouter, signer);

    const { path, amountOut } = await findBestPath(
      fromToken,
      toToken,
      amountIn
    );

    const decimalsIn = await getTokenDecimals(path[0]);
    const amountInParsed = parseUnits(amountIn, decimalsIn);

    /* ---- Slippage ---- */
    const slippageBps = BigInt(Math.floor(slippagePercent * 100));
    const amountOutMin =
      (amountOut * (10_000n - slippageBps)) / 10_000n;

    /* ---- Approval ---- */
    const tokenIn = new Contract(
      path[0],
      MINIMAL_ERC20_ABI,
      signer
    );

    const owner = await signer.getAddress();
    const allowance: bigint = await tokenIn.allowance(
      owner,
      routerAddress
    );

    if (allowance < amountInParsed) {
      const tx = await tokenIn.approve(
        routerAddress,
        MaxUint256
      );
      await tx.wait();
    }

    /* ---- Swap ---- */
    const deadline =
      Math.floor(Date.now() / 1000) +
      APP_CONSTANTS.DEFAULT_DEADLINE_SECONDS;

    const tx = await router.swapExactTokensForTokens(
      amountInParsed,
      amountOutMin,
      path,
      to,
      deadline
    );

    return tx.wait();
  };

  return {
    getAmountOut,
    swapExactTokensForTokens,
  };
};
