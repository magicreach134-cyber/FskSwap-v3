// src/components/WalletConnectButton.jsx
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

const WalletConnectButton = ({ provider, setSigner }) => {
  const [userAddress, setUserAddress] = useState("");
  const [connected, setConnected] = useState(false);

  const connectMetaMask = async () => {
    if (!window.ethereum) return alert("MetaMask is not installed");
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      const tempSigner = tempProvider.getSigner();
      const address = await tempSigner.getAddress();
      setSigner(tempSigner);
      setUserAddress(address);
      setConnected(true);
    } catch (err) {
      console.error(err);
      alert("Failed to connect MetaMask");
    }
  };

  const connectWalletConnect = async () => {
    try {
      const wcProvider = new WalletConnectProvider({
        rpc: {
          97: "https://data-seed-prebsc-1-s1.binance.org:8545", // BSC Testnet
        },
      });
      await wcProvider.enable();
      const tempProvider = new ethers.providers.Web3Provider(wcProvider);
      const tempSigner = tempProvider.getSigner();
      const address = await tempSigner.getAddress();
      setSigner(tempSigner);
      setUserAddress(address);
      setConnected(true);

      // Optional: disconnect on session end
      wcProvider.on("disconnect", () => {
        setConnected(false);
        setUserAddress("");
      });
    } catch (err) {
      console.error(err);
      alert("Failed to connect WalletConnect");
    }
  };

  const connectWallet = async () => {
    const walletChoice = prompt(
      "Choose wallet: 1 = MetaMask/Trust Wallet, 2 = WalletConnect"
    );
    if (walletChoice === "1") {
      connectMetaMask();
    } else if (walletChoice === "2") {
      connectWalletConnect();
    } else {
      alert("Invalid choice");
    }
  };

  return (
    <button
      onClick={connectWallet}
      style={{
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        background: "#fff",
        cursor: "pointer",
      }}
    >
      {connected ? userAddress.slice(0, 6) + "..." + userAddress.slice(-4) : "Connect Wallet"}
    </button>
  );
};

export default WalletConnectButton;
