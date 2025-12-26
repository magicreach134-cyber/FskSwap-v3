"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { JsonRpcSigner, BrowserProvider }
import WalletConnectProvider from "@walletconnect/web3-provider";

interface WalletContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
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
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");

  const connectWallet = async (type: "metamask" | "trustwallet" | "walletconnect") => {
    try {
      let web3Provider: BrowserProvider | null = null;

      if ((type === "metamask" || type === "trustwallet") && typeof window !== "undefined" && (window as any).ethereum) {
        await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        web3Provider = new BrowserProvider((window as any).ethereum);
      }

      if (type === "walletconnect") {
        const wcProvider = new WalletConnectProvider({
          rpc: { 97: "https://data-seed-prebsc-1-s1.binance.org:8545" },
          chainId: 97,
        });
        await wcProvider.enable();
        web3Provider = new BrowserProvider(wcProvider as any);
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

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount("");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => window.location.reload();

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
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
