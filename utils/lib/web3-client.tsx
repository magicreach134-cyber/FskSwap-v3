import { ethers } from "ethers";
import { routerAddress, FSKRouterABI, factoryAddress, FSKFactoryABI } from "@/utils/contracts";

export const getProvider = () => {
  if (window.ethereum) return new ethers.providers.Web3Provider(window.ethereum);
  throw new Error("No Ethereum provider found");
};

export const getSigner = (provider: ethers.providers.Web3Provider) => provider.getSigner();

export const getRouterContract = (provider: ethers.providers.Provider | ethers.Signer) => {
  return new ethers.Contract(routerAddress, FSKRouterABI, provider);
};

export const getFactoryContract = (provider: ethers.providers.Provider | ethers.Signer) => {
  return new ethers.Contract(factoryAddress, FSKFactoryABI, provider);
};
