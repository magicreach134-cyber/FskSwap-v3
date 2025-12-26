"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ethers } from "ethers";

interface WalletContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert("No wallet detected");
      return;
    }

    const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
    await browserProvider.send("eth_requestAccounts", []);

    const signerInstance = await browserProvider.getSigner();
    const address = await signerInstance.getAddress();

    setProvider(browserProvider);
    setSigner(signerInstance);
    setAccount(address);
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount("");
  };

  // Auto-reconnect if already authorized
  useEffect(() => {
    if (!(window as any).ethereum) return;

    (async () => {
      const accounts = await (window as any).ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        await connectWallet();
      }
    })();
  }, []);

  return (
    <WalletContext.Provider
      value={{ provider, signer, account, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used inside WalletProvider");
  }
  return ctx;
};
