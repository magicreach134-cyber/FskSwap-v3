"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import { useWallet } from "../hooks/useWallet";
import { useTheme } from "../hooks/useTheme";
import { useSwap } from "../hooks/useSwap";
import useTokenBalance from "../hooks/useTokenBalance";
import { useTokenApproval } from "../hooks/useTokenAllowance"; 
import "../style/swap.css";
import {
  fskRouterAddress,
  FSKRouterABI,
  BTC_ADDRESS,
  FUSDT_ADDRESS,
} from "../utils/constants";

const Swap = () => {
  const { theme, toggleTheme } = useTheme();
  const { provider, signer, account, connectWallet } = useWallet();

  const [fromToken, setFromToken] = useState(BTC_ADDRESS);
  const [toToken, setToToken] = useState(FUSDT_ADDRESS);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("0");

  const swap = useSwap(signer);

  const fromBalance = useTokenBalance(fromToken, account, provider);
  const toBalance = useTokenBalance(toToken, account, provider);

  const { approved, checkAllowance, approve } = useTokenApproval(signer, fromToken, fskRouterAddress);

  useEffect(() => {
    if (account) checkAllowance(account);
  }, [account, fromToken]);

  useEffect(() => {
    const getAmount = async () => {
      if (!amountIn || !swap) return setAmountOut("0");
      try {
        const out = await swap.getAmountOut(amountIn, [fromToken, toToken]);
        setAmountOut(out);
      } catch (err) {
        console.error(err);
        setAmountOut("0");
      }
    };
    getAmount();
  }, [amountIn, fromToken, toToken, swap]);

  const handleSwap = async () => {
    if (!approved) {
      await approve(amountIn);
    }
    try {
      await swap.swap(amountIn, amountOut, [fromToken, toToken], account);
      alert("Swap successful!");
      setAmountIn("");
    } catch (err) {
      console.error(err);
      alert("Swap failed: " + err.message);
    }
  };

  return (
    <div className={`swap-page ${theme}`}>
      <header className="swap-header">
        <div className="logo">
          <img src="/assets/logo.svg" alt="FSKSwap" />
          <span>FSKSwap</span>
        </div>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={() => {}} />
          <button onClick={toggleTheme}>{theme === "light" ? "🌞" : "🌙"}</button>
        </div>
      </header>

      <main className="swap-container">
        <h2>Swap Tokens</h2>

        <div className="swap-card">
          <div className="token-input">
            <label>From:</label>
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
            <p>Balance: {fromBalance}</p>
          </div>

          <div className="token-input">
            <label>To:</label>
            <input type="text" value={amountOut} disabled />
            <p>Balance: {toBalance}</p>
          </div>

          <button onClick={handleSwap} disabled={!amountIn || parseFloat(amountIn) <= 0}>
            {approved ? "Swap" : "Approve & Swap"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Swap;
