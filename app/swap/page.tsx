"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useSwap } from "@/hooks/useSwap";
import TokenSelect from "@/components/TokenSelect";

import {
  TOKEN_LIST,
  TOKEN_ADDRESS_MAP,
  APP_CONSTANTS,
} from "@/utils/constants";

import "@/styles/swap.css";

type TokenSymbol = keyof typeof TOKEN_ADDRESS_MAP;

export default function SwapPage() {
  const { provider, signer, account } = useWallet();
  const { getAmountOut, swapExactTokensForTokens } = useSwap(provider, signer);

  const [fromToken, setFromToken] = useState(TOKEN_LIST[0]);
  const [toToken, setToToken] = useState(TOKEN_LIST[1]);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState<number>(
    APP_CONSTANTS.DEFAULT_SLIPPAGE_PERCENT
  );
  const [loading, setLoading] = useState(false);

  /* ---------- Estimate output ---------- */
  const estimateAmountOut = useCallback(async () => {
    if (!amountIn || !getAmountOut || Number(amountIn) <= 0) {
      setAmountOut("");
      return;
    }

    try {
      const quoted = await getAmountOut(
        fromToken.symbol as TokenSymbol,
        toToken.symbol as TokenSymbol,
        amountIn
      );
      setAmountOut(quoted ?? "");
    } catch (err) {
      console.error("Quote error:", err);
      setAmountOut("");
    }
  }, [amountIn, fromToken.symbol, toToken.symbol, getAmountOut]);

  useEffect(() => {
    estimateAmountOut();
  }, [estimateAmountOut]);

  /* ---------- Swap direction ---------- */
  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmountOut("");
  };

  /* ---------- Execute swap ---------- */
  const handleSwap = async () => {
    if (!signer || !account) {
      alert("Connect wallet first");
      return;
    }

    if (!amountIn || Number(amountIn) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      await swapExactTokensForTokens({
        amountIn,
        fromToken: fromToken.symbol as TokenSymbol,
        toToken: toToken.symbol as TokenSymbol,
        to: account,
        slippagePercent: slippage,
      });

      setAmountIn("");
      setAmountOut("");
      alert("Swap successful");
    } catch (err: any) {
      console.error("Swap failed:", err);
      alert(err?.reason || err?.message || "Swap failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="swap-page">
      <main className="swap-container">
        <h2>Swap Tokens</h2>

        <div className={`swap-card ${loading ? "swap-loading" : ""}`}>
          <div className="swap-token-row">
            <div className="swap-token-box">
              <label>From</label>
              <TokenSelect selectedToken={fromToken} onSelect={setFromToken} />
            </div>

            <button
              type="button"
              className="swap-switch-button"
              onClick={handleSwitchTokens}
              title="Switch tokens"
            >
              ⇅
            </button>

            <div className="swap-token-box">
              <label>To</label>
              <TokenSelect selectedToken={toToken} onSelect={setToToken} />
            </div>
          </div>

          <label>Amount In</label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />

          <label>Slippage (%)</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
          />

          <div className="swap-info">
            <span>Estimated Output</span>
            <strong>{amountOut || "--"}</strong>
          </div>

          <button
            className="swap-submit"
            onClick={handleSwap}
            disabled={loading || !amountIn || Number(amountIn) <= 0}
          >
            {loading ? "Swapping..." : "Swap"}
          </button>
        </div>
      </main>
    </div>
  );
}
