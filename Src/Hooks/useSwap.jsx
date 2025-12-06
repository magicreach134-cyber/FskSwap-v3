import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKRouterABI, fskRouterAddress } from "../utils/constants";

export const useSwap = (signer) => {
  const [routerContract, setRouterContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const router = new ethers.Contract(fskRouterAddress, FSKRouterABI, signer);
      setRouterContract(router);
    }
  }, [signer]);

  const getAmountOut = async (amountIn, path) => {
    if (!routerContract) return;
    const amountOut = await routerContract.getAmountsOut(ethers.utils.parseUnits(amountIn.toString(), 18), path);
    return ethers.utils.formatUnits(amountOut[amountOut.length - 1], 18);
  };

  const swap = async (amountIn, amountOutMin, path, to) => {
    if (!routerContract) return;
    const tx = await routerContract.swapExactTokensForTokens(
      ethers.utils.parseUnits(amountIn.toString(), 18),
      ethers.utils.parseUnits(amountOutMin.toString(), 18),
      path,
      to,
      Math.floor(Date.now() / 1000) + 60 * 20
    );
    return await tx.wait();
  };

  return { getAmountOut, swap };
};
