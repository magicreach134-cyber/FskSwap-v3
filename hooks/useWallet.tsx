"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

interface WalletState {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string;
  connectWallet: () => Promise<void>;
}

export const useWallet = (): WalletState => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (!eth) return;

    const init = async () => {
      try {
        const browserProvider = new BrowserProvider(eth);
        const signerInstance = await browserProvider.getSigner();
        const address = await signerInstance.getAddress();

        setProvider(browserProvider);
        setSigner(signerInstance);
        setAccount(address);
      } catch {
        setProvider(null);
        setSigner(null);
        setAccount("");
      }
    };

    init();

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || "");
    };

    const handleChainChanged = () => window.location.reload();

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert("Install MetaMask or compatible wallet");
      return;
    }

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0] || "");
  };

  return {
    provider,
    signer,
    account,
    connectWallet,
  };
};
