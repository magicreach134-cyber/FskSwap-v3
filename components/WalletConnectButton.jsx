"use client";

import { useState } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";

const WalletConnectButton = ({ setSigner }) => {
  const [account, setAccount] = useState("");

  const connectWallet = async (type) => {
    try {
      let web3Provider;

      if ((type === "metamask" || type === "trustwallet") && window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      }

      if (type === "walletconnect") {
        const wcProvider = new WalletConnectProvider({
          rpc: {
            97: "https://data-seed-prebsc-1-s1.binance.org:8545",
          },
          chainId: 97,
        });

        await wcProvider.enable();
        web3Provider = new ethers.providers.Web3Provider(wcProvider);
      }

      if (!web3Provider) throw new Error("No provider detected");

      const signer = web3Provider.getSigner();
      const address = await signer.getAddress();

      setSigner(signer);
      setAccount(address);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert(err.message || "Wallet connection failed");
    }
  };

  return (
    <div className="wallet-connect">
      {account ? (
        <span>
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      ) : (
        <>
          <button onClick={() => connectWallet("metamask")}>MetaMask</button>
          <button onClick={() => connectWallet("trustwallet")}>Trust Wallet</button>
          <button onClick={() => connectWallet("walletconnect")}>WalletConnect</button>
        </>
      )}
    </div>
  );
};

export default WalletConnectButton;
