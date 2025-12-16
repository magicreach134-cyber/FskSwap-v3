// useSwap.ts
import { useMemo } from "react";
import { ethers, BigNumber } from "ethers";
import { ABIS, routerAddress, TOKENS, MINIMAL_ERC20_ABI, APP_CONSTANTS } from "../utils/constants";

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

  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    if (!signer) return 18;
    try {
      const token = new ethers.Contract(tokenAddress, MINIMAL_ERC20_ABI, signer);
      return await token.decimals();
    } catch {
      return 18;
    }
  };

  // Automatically find the best path
  const findBestPath = async (
    fromToken: keyof typeof TOKENS,
    toToken: keyof typeof TOKENS,
    amountIn: string
  ): Promise<{ path: string[]; amountOut: string }> => {
    if (!routerRead) return { path: [], amountOut: "0" };

    const directPath = [TOKENS[fromToken], TOKENS[toToken]];
    const wbnbPath = [TOKENS[fromToken], TOKENS.WBNB, TOKENS[toToken]];

    const decimalsIn = await getTokenDecimals(TOKENS[fromToken]);
    const decimalsOut = await getTokenDecimals(TOKENS[toToken]);

    const amountInParsed = ethers.utils.parseUnits(amountIn, decimalsIn);

    let bestAmountOut = BigNumber.from(0);
    let bestPath = directPath;

    try {
      // Direct
      const directAmounts = await routerRead.getAmountsOut(amountInParsed, directPath);
      if (directAmounts[directAmounts.length - 1].gt(bestAmountOut)) {
        bestAmountOut = directAmounts[directAmounts.length - 1];
        bestPath = directPath;
      }
    } catch {}

    try {
      // Via WBNB
      const wbnbAmounts = await routerRead.getAmountsOut(amountInParsed, wbnbPath);
      if (wbnbAmounts[wbnbAmounts.length - 1].gt(bestAmountOut)) {
        bestAmountOut = wbnbAmounts[wbnbAmounts.length - 1];
        bestPath = wbnbPath;
      }
    } catch {}

    const formattedOut = ethers.utils.formatUnits(bestAmountOut, decimalsOut);
    return { path: bestPath, amountOut: formattedOut };
  };

  const getAmountOut = async (fromToken: keyof typeof TOKENS, toToken: keyof typeof TOKENS, amountIn: string) => {
    return await findBestPath(fromToken, toToken, amountIn);
  };

  const swapExactTokensForTokens = async ({
    amountIn,
    slippagePercent = APP_CONSTANTS.DEFAULT_SLIPPAGE_PERCENT,
    fromToken,
    toToken,
    to,
  }: SwapParams) => {
    if (!routerWrite || !signer) throw new Error("Wallet not connected");

    const { path, amountOut } = await findBestPath(fromToken, toToken, amountIn);

    const decimalsIn = await getTokenDecimals(path[0]);
    const decimalsOut = await getTokenDecimals(path[path.length - 1]);

    const amountInParsed = ethers.utils.parseUnits(amountIn, decimalsIn);
    const amountOutParsed = ethers.utils.parseUnits(amountOut, decimalsOut);

    const amountOutMin = amountOutParsed.mul(10000 - Math.floor(slippagePercent * 100)).div(10000);

    // Approve
    const tokenContract = new ethers.Contract(path[0], MINIMAL_ERC20_ABI, signer);
    const allowance = await tokenContract.allowance(await signer.getAddress(), routerAddress);
    if (allowance.lt(amountInParsed)) {
      const approveTx = await tokenContract.approve(routerAddress, ethers.constants.MaxUint256);
      await approveTx.wait();
    }

    const deadline = Math.floor(Date.now() / 1000) + APP_CONSTANTS.DEFAULT_DEADLINE_SECONDS;
    const tx = await routerWrite.swapExactTokensForTokens(amountInParsed, amountOutMin, path, to, deadline);

    return await tx.wait();
  };

  return { getAmountOut, swapExactTokensForTokens };
};
