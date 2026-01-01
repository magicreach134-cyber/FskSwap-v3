"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";

const WalletConnectButton = () => {
  const { account, connectWallet } = useWallet();
  const [shortAccount, setShortAccount] = useState("");

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
        </div>
      ) : (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnectButton;
