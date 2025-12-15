import { BigNumber, ethers } from "ethers";
import { getRouterContract } from "./web3-client";

export const getAmountOut = async (
  provider: ethers.providers.Provider,
  amountIn: BigNumber,
  path: string[]
): Promise<BigNumber> => {
  const router = getRouterContract(provider);
  const amounts: BigNumber[] = await router.getAmountsOut(amountIn, path);
  return amounts[amounts.length - 1];
};
