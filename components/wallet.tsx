"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, formatEther } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Wallet = () => {
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");

  useEffect(() => {
    const initWallet = async () => {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const bal = await provider.getBalance(addr);

      setAddress(addr);
      setBalance(formatEther(bal));
    };

    initWallet().catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Wallet Info</h2>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Balance:</strong> {balance} BNB</p>
    </div>
  );
};

export default Wallet;
