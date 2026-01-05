"use client";

import { useMemo } from "react";
import {
  Contract,
  JsonRpcProvider,
  BrowserProvider,
  parseUnits,
  formatUnits,
  MaxUint256,
} from "ethers";
import { useAccount, useWalletClient } from "wagmi";

import {
  ABIS,
  routerAddress,
  TOKENS,
  MINIMAL_ERC20_ABI,
  APP_CONSTANTS,
  BNB_TESTNET_RPC,
} from "@/utils/constants";

type TokenKey = keyof typeof TOKENS;

type SwapParams = {
  amountIn: string;
  fromToken: TokenKey;
  toToken: TokenKey;
  to: string;
  slippagePercent?: number;
};

export const useSwap = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  /* ================= READ PROVIDER ================= */
  const readProvider = useMemo(() => new JsonRpcProvider(BNB_TESTNET_RPC), []);

  /* ================= READ ROUTER ================= */
  const routerRead = useMemo(() => {
    return new Contract(routerAddress, ABIS.FSKRouter, readProvider);
  }, [readProvider]);

  /* ================= ERC20 HELPERS ================= */
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    try {
      const token = new Contract(tokenAddress, MINIMAL_ERC20_ABI, readProvider);
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

  /* ================= WRITE SIGNER ================= */
  const getSigner = async () => {
    if (!walletClient || !isConnected) throw new Error("Wallet not connected");
    const provider = new BrowserProvider(walletClient.transport);
    return provider.getSigner();
  };

  /* ================= SWAP ================= */
  const swapExactTokensForTokens = async ({
    amountIn,
    fromToken,
    toToken,
    to,
    slippagePercent = APP_CONSTANTS.DEFAULT_SLIPPAGE_PERCENT,
  }: SwapParams) => {
    if (!address) throw new Error("No wallet connected");

    const signer = await getSigner();
    const router = new Contract(routerAddress, ABIS.FSKRouter, signer);

    const { path, amountOut } = await findBestPath(fromToken, toToken, amountIn);

    const decimalsIn = await getTokenDecimals(path[0]);
    const amountInParsed = parseUnits(amountIn, decimalsIn);

    // Slippage
    const slippageBps = BigInt(Math.floor(slippagePercent * 100));
    const amountOutMin = (amountOut * (10_000n - slippageBps)) / 10_000n;

    // Approval
    const tokenIn = new Contract(path[0], MINIMAL_ERC20_ABI, signer);
    const allowance: bigint = await tokenIn.allowance(address, routerAddress);
    if (allowance < amountInParsed) {
      const tx = await tokenIn.approve(routerAddress, MaxUint256);
      await tx.wait();
    }

    // Swap
    const deadline = Math.floor(Date.now() / 1000) + APP_CONSTANTS.DEFAULT_DEADLINE_SECONDS;
    const tx = await router.swapExactTokensForTokens(
      amountInParsed,
      amountOutMin,
      path,
      to,
      deadline
    );
    await tx.wait();
  };

  return {
    getAmountOut,
    swapExactTokensForTokens,
  };
};
