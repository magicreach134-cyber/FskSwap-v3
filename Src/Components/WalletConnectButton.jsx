import { useState } from "react";

const WalletConnectButton = ({ provider, setSigner }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      setConnected(true);
      if (provider) setSigner(provider.getSigner());
    } catch (err) {
      console.error(err);
      alert("Wallet connection failed");
    }
  };

  return (
    <button onClick={connectWallet}>
      {connected ? address.slice(0, 6) + "..." + address.slice(-4) : "Connect Wallet"}
    </button>
  );
};

export default WalletConnectButton;
