"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Wallet = () => {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.send("eth_requestAccounts", []).then(() => {
        provider.getSigner().getAddress().then(setAddress);
        provider.getBalance(address).then((bal) => setBalance(ethers.utils.formatEther(bal)));
      });
    }
  }, [address]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Wallet Info</h2>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>Balance:</strong> {balance} BNB</p>
    </div>
  );
};

export default Wallet;
