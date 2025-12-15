import { Contract, ethers } from 'ethers';
import erc20Abi from '@/lib/abis/erc20.json';
import routerAbi from '@/lib/abis/router.json';
import factoryAbi from '@/lib/abis/factory.json';

export const getErc20Contract = (
  tokenAddress: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  return new Contract(tokenAddress, erc20Abi, signerOrProvider);
};

export const getRouterContract = (
  routerAddress: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  return new Contract(routerAddress, routerAbi, signerOrProvider);
};

export const getFactoryContract = (
  factoryAddress: string,
  signerOrProvider: ethers.Signer | ethers.providers.Provider
) => {
  return new Contract(factoryAddress, factoryAbi, signerOrProvider);
};
