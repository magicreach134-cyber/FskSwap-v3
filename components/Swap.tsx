"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWalletClient } from "wagmi"; // ✅ Replaces useSigner

const PANCAKE_ROUTER = "0xD99D1c07F094a657180b141Bbdbd60aE03883f07";
const FSK_ADDRESS = "0xYourFSKAddress"; // Replace with your token address

export default function Swap() {
  // ✅ Get signer (wallet client) from connected wallet
  const { data: walletClient } = useWalletClient();

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");

  const handleSwap = async () => {
    if (!walletClient) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      // Get ethers.js signer from wagmi wallet client
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      // Example: here’s where you’d call your router contract
      // const router = new ethers.Contract(PANCAKE_ROUTER, routerAbi, signer);
      // await router.swapExactTokensForTokens(...)

      console.log("Swapping", amountIn, "for", amountOut);
      alert("Swap simulated! (Add your logic here)");
    } catch (error) {
      console.error(error);
      alert("Error performing swap. See console for details.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Swap</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Amount In:</label>
        <input
          type="text"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          placeholder="Enter amount to swap"
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Amount Out (est):</label>
        <input
          type="text"
          value={amountOut}
          onChange={(e) => setAmountOut(e.target.value)}
          placeholder="Output estimate"
        />
      </div>

      <button onClick={handleSwap}>Swap</button>
    </div>
  );
}
