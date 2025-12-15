"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import { useSwap } from "../hooks/useSwap";
import { TOKEN_COLORS } from "../utils/constants";
import "../styles/swap.css";

const Swap = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [fromToken, setFromToken] = useState("FSK");
  const [toToken, setToToken] = useState("FUSDT");

  const { getAmountOut, swap } = useSwap(signer);

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setAccount);
    }
  }, []);

  useEffect(() => {
    const fetchOut = async () => {
      if (!amountIn || !getAmountOut) return;
      const path = [fromToken, toToken]; // replace with actual token addresses
      const out = await getAmountOut(amountIn, path);
      setAmountOut(out);
    };
    fetchOut();
  }, [amountIn, fromToken, toToken, getAmountOut]);

  const handleSwap = async () => {
    if (!amountIn || !amountOut) return;
    const path = [fromToken, toToken];
    try {
      await swap(amountIn, amountOut, path, account);
      alert("Swap successful!");
      setAmountIn("");
      setAmountOut("");
    } catch (err) {
      console.error(err);
      alert("Swap failed: " + err.message);
    }
  };

  return (
    <div className="swap-page">
      <header className="swap-header">
        <div className="logo">
          <img src="/assets/logo.svg" alt="FSKSwap" />
          <span>FSKSwap</span>
        </div>
        <nav>
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/staking">Staking</a>
          <a href="/flashswap">FlashSwap</a>
        </nav>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="swap-container">
        <h2>Swap Tokens</h2>

        <div className="swap-card">
          <label>From Token</label>
          <input
            type="text"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            style={{ color: TOKEN_COLORS[fromToken] || "#fff" }}
          />
          <label>To Token</label>
          <input
            type="text"
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            style={{ color: TOKEN_COLORS[toToken] || "#fff" }}
          />
          <label>Amount</label>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />
          <p>Estimated Output: {amountOut}</p>
          <button onClick={handleSwap}>Swap</button>
        </div>
      </main>
    </div>
  );
};

export default Swap;
