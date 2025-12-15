"use client";

import { useState } from "react";
import { ethers } from "ethers";

interface Props {
  provider?: any;
  setSigner?: (signer: any) => void;
}

const WalletConnectButton = ({ provider, setSigner }: Props) => {
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const p = new ethers.providers.Web3Provider(window.ethereum);
      const signer = p.getSigner();
      setSigner?.(signer);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setConnected(true);
    } else {
      alert("No wallet found");
    }
  };

  return (
    <button onClick={connectWallet} className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded text-gray-900">
      {connected ? "Connected" : "Connect Wallet"}
    </button>
  );
};

export default WalletConnectButton;
