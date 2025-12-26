"use client";

import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";

const WalletConnectButton = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const [shortAccount, setShortAccount] = useState<string>("");

  useEffect(() => {
    if (account) {
      setShortAccount(`${account.slice(0, 6)}...${account.slice(-4)}`);
    } else {
      setShortAccount("");
    }
  }, [account]);

  return (
    <div className="wallet-connect">
      {account ? (
        <div className="connected-account">
          <span>{shortAccount}</span>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <div className="connect-buttons">
          <button onClick={() => connectWallet("metamask")}>
            MetaMask
          </button>
          <button onClick={() => connectWallet("trustwallet")}>
            Trust Wallet
          </button>
          <button onClick={() => connectWallet("walletconnect")}>
            WalletConnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
