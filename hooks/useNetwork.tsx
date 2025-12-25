"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";

/* ======================================================
   NETWORK CONFIG
   ====================================================== */

export interface NetworkConfig {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
}

/* ---- BNB Networks ---- */

export const BSC_TESTNET: NetworkConfig = {
  chainId: 97,
  chainIdHex: "0x61",
  name: "BNB Smart Chain Testnet",
  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18
  },
  blockExplorerUrls: ["https://testnet.bscscan.com"]
};

export const BSC_MAINNET: NetworkConfig = {
  chainId: 56,
  chainIdHex: "0x38",
  name: "BNB Smart Chain",
  rpcUrls: ["https://bsc-dataseed.binance.org"],
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18
  },
  blockExplorerUrls: ["https://bscscan.com"]
};

/* ======================================================
   useNetwork Hook
   ====================================================== */

const useNetwork = (expectedNetwork: NetworkConfig = BSC_TESTNET) => {
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>("Unknown");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  /* ---------------- GET CURRENT NETWORK ---------------- */
  const detectNetwork = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setIsReady(false);
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      setChainId(network.chainId);
      setNetworkName(network.name || "Unknown");
      setIsCorrectNetwork(network.chainId === expectedNetwork.chainId);
      setIsReady(true);
    } catch (err) {
      console.error("Network detection failed:", err);
      setIsReady(false);
    }
  }, [expectedNetwork.chainId]);

  /* ---------------- SWITCH NETWORK ---------------- */
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("No wallet provider found");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: expectedNetwork.chainIdHex }]
      });
    } catch (err: any) {
      /* ---- Network not added ---- */
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: expectedNetwork.chainIdHex,
              chainName: expectedNetwork.name,
              rpcUrls: expectedNetwork.rpcUrls,
              nativeCurrency: expectedNetwork.nativeCurrency,
              blockExplorerUrls: expectedNetwork.blockExplorerUrls
            }
          ]
        });
      } else {
        throw err;
      }
    }
  }, [expectedNetwork]);

  /* ---------------- LISTENERS ---------------- */
  useEffect(() => {
    detectNetwork();

    if (!window.ethereum) return;

    const handleChainChanged = () => {
      detectNetwork();
    };

    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [detectNetwork]);

  return {
    /* state */
    chainId,
    networkName,
    isCorrectNetwork,
    isReady,

    /* config */
    expectedChainId: expectedNetwork.chainId,
    expectedNetworkName: expectedNetwork.name,

    /* actions */
    switchNetwork,
    refreshNetwork: detectNetwork
  };
};

export default useNetwork;
