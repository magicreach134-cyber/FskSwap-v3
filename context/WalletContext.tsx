"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

interface WalletContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string;
  connectWallet: (
    type: "metamask" | "trustwallet" | "walletconnect"
  ) => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  provider: null,
  signer: null,
  account: "",
  connectWallet: async () => {},
  disconnectWallet: async () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");

  // Keep WalletConnect instance single
  const wcRef = useRef<WalletConnectProvider | null>(null);

  const resetState = () => {
    setProvider(null);
    setSigner(null);
    setAccount("");
  };

  const connectWallet = async (
    type: "metamask" | "trustwallet" | "walletconnect"
  ) => {
    try {
      let web3Provider: BrowserProvider;

      // --- Injected wallets (MetaMask / TrustWallet) ---
      if (
        (type === "metamask" || type === "trustwallet") &&
        typeof window !== "undefined" &&
        (window as any).ethereum
      ) {
        const injected = (window as any).ethereum;

        await injected.request({ method: "eth_requestAccounts" });

        web3Provider = new BrowserProvider(injected);
      }
      // --- WalletConnect ---
      else if (type === "walletconnect") {
        if (wcRef.current) {
          await wcRef.current.disconnect();
          wcRef.current = null;
        }

        const wcProvider = new WalletConnectProvider({
          rpc: {
            97: "https://data-seed-prebsc-1-s1.binance.org:8545",
          },
          chainId: 97,
        });

        await wcProvider.enable();
        wcRef.current = wcProvider;

        web3Provider = new BrowserProvider(wcProvider as any);
      } else {
        throw new Error("No compatible wallet provider found");
      }

      const signerInstance = await web3Provider.getSigner();
      const address = await signerInstance.getAddress();

      setProvider(web3Provider);
      setSigner(signerInstance);
      setAccount(address);
    } catch (error: any) {
      console.error("Wallet connection failed:", error);
      resetState();
      alert(error?.message || "Wallet connection failed");
    }
  };

  const disconnectWallet = async () => {
    try {
      if (wcRef.current) {
        await wcRef.current.disconnect();
        wcRef.current = null;
      }
    } finally {
      resetState();
    }
  };

  // Handle injected wallet events (once)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = (window as any).ethereum;
    if (!eth || !eth.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        resetState();
      } else {
        setAccount(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        account,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
