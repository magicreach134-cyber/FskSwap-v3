"use client";

import { useWallet } from "../context/WalletContext";

const WalletConnectButton = () => {
  const { account, connectWallet } = useWallet();

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
