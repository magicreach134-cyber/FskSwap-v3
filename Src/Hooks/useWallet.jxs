
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const prov = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(prov);

    const sign = prov.getSigner();
    setSigner(sign);

    sign.getAddress()
      .then(setAccount)
      .catch(() => setAccount(null));

    const handleAccountsChanged = (accounts) => setAccount(accounts[0] || null);
    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask or compatible wallet");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  return { provider, signer, account, connectWallet };
};
