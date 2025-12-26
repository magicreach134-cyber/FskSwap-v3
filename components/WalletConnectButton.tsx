"use client";

import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";

const WalletConnectButton = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const [shortAccount, setShortAccount] = useState("");

  useEffect(() => {
    if (account) {
      setShortAccount(`${account.slice(0, 6)}...${account.slice(-4)}`);
    } else {
      setShortAccount("");
    }
  }, [account]);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet("metamask"); // Reconnect with new account
        }
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        (window as any).ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [connectWallet, disconnectWallet]);

  return (
    <div className="wallet-connect">
      {account ? (
        <div className="connected-account">
          <span>{shortAccount}</span>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <div className="connect-buttons">
          <button onClick={() => connectWallet("metamask")}>MetaMask</button>
          <button onClick={() => connectWallet("trustwallet")}>Trust Wallet</button>
          <button onClick={() => connectWallet("walletconnect")}>WalletConnect</button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
