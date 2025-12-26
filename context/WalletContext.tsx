"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

interface WalletContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string;
  connectWallet: (type: "metamask" | "trustwallet" | "walletconnect") => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  provider: null,
  signer: null,
  account: "",
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");

  // Connect wallet
  const connectWallet = async (type: "metamask" | "trustwallet" | "walletconnect") => {
    try {
      let web3Provider: ethers.BrowserProvider | null = null;

      if ((type === "metamask" || type === "trustwallet") && (window as any).ethereum) {
        await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        web3Provider = new ethers.BrowserProvider((window as any).ethereum);
      }

      if (type === "walletconnect") {
        const wcProvider = new WalletConnectProvider({
          rpc: { 97: "https://data-seed-prebsc-1-s1.binance.org:8545" },
          chainId: 97,
        });
        await wcProvider.enable();
        web3Provider = new ethers.BrowserProvider(wcProvider as any);
      }

      if (!web3Provider) throw new Error("No provider detected");

      setProvider(web3Provider);
      const s = await web3Provider.getSigner();
      setSigner(s);
      const addr = await s.getAddress();
      setAccount(addr);
    } catch (err: any) {
      console.error("Wallet connection failed:", err);
      alert(err?.message || "Wallet connection failed");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount("");
  };

  // Handle account change (MetaMask/Trust Wallet)
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", () => window.location.reload());

      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ provider, signer, account, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};
