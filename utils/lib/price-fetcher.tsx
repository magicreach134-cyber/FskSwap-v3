import { BigNumber, ethers } from 'ethers';
import { getRouterContract } from '@/lib/web3-client';

export const getAmountOut = async (
  routerAddress: string,
  provider: ethers.providers.Provider,
  amountIn: BigNumber,
  path: string[]
): Promise<BigNumber> => {
  const router = getRouterContract(routerAddress, provider);

  const amounts: BigNumber[] = await router.getAmountsOut(
    amountIn,
    path
  );

  return amounts[amounts.length - 1];
};
