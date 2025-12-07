import { ethers } from "ethers";

export const getProvider = () => {
  if (window.ethereum) return new ethers.providers.Web3Provider(window.ethereum);
  throw new Error("No Ethereum provider found");
};

export const getSigner = (provider: ethers.providers.Web3Provider) => provider.getSigner();
