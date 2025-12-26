"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "../../context/WalletContext";
import { useSwap } from "../../hooks/useSwap";

import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import TokenSelect from "../../components/TokenSelect";

import { TOKEN_LIST, TOKEN_ADDRESS_MAP, APP_CONSTANTS } from "../../utils/constants";
import "../../styles/swap.css";

type TokenSymbol = keyof typeof TOKEN_ADDRESS_MAP;

export default function SwapPage() {
  const { provider, signer, account } = useWallet();
  const { getAmountOut, swapExactTokensForTokens } = useSwap(provider, signer);

  const [fromToken, setFromToken] = useState(TOKEN_LIST[0]);
  const [toToken, setToToken] = useState(TOKEN_LIST[1]);

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(APP_CONSTANTS.DEFAULT_SLIPPAGE_PERCENT);
  const [loading, setLoading] = useState(false);

  const estimateAmountOut = useCallback(async () => {
    if (!amountIn || !getAmountOut) {
      setAmountOut("");
      return;
    }

    try {
      const out = await getAmountOut(
        fromToken.symbol as TokenSymbol,
        toToken.symbol as TokenSymbol,
        amountIn
      );
      setAmountOut(out ?? "");
    } catch (err) {
      console.error("Quote error:", err);
      setAmountOut("");
    }
  }, [amountIn, fromToken, toToken, getAmountOut]);

  useEffect(() => {
    estimateAmountOut();
  }, [estimateAmountOut]);

  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setAmountOut("");
  };

  const handleSwap = async () => {
    if (!signer || !amountIn || !amountOut) return;

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
      <header className="swap-header">
        <div className="swap-brand">
          <img src="/logo.png" alt="FSKSwap" />
          <span>FSKSwap</span>
        </div>

        <nav className="swap-nav">
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/farm">Farm</a>
          <a href="/flashswap">FlashSwap</a>
        </nav>

        <div className="swap-header-actions">
          <WalletConnectButton />
          <ThemeSwitch />
        </div>
      </header>

      <main className="swap-container">
        <h2>Token Swap</h2>

        <div className={`swap-card ${loading ? "swap-loading" : ""}`}>
          <div className="swap-token-row">
            <div className="swap-token-box">
              <label>From</label>
              <TokenSelect selectedToken={fromToken} onSelect={setFromToken} />
            </div>

            <button
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
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />

          <label>Slippage (%)</label>
          <input
            type="number"
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
            disabled={loading || !amountIn}
          >
            {loading ? "Swapping..." : "Swap"}
          </button>
        </div>
      </main>
    </div>
  );
}
