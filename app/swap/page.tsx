"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import TokenSelect from "../../components/TokenSelect";
import { useSwap } from "../../hooks/useSwap";
import { TOKEN_LIST, TOKEN_ADDRESS_MAP, APP_CONSTANTS } from "../../utils/constants";
import "../../styles/swap.css";

export default function SwapPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");

  const [fromToken, setFromToken] = useState(TOKEN_LIST[0]);
  const [toToken, setToToken] = useState(TOKEN_LIST[1]);
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(APP_CONSTANTS.DEFAULT_SLIPPAGE_PERCENT);
  const [loading, setLoading] = useState<boolean>(false);

  const { getAmountOut, swapExactTokensForTokens } = useSwap(provider, signer);

  // ---------------- provider / signer ----------------
  useEffect(() => {
    if (!(window as any).ethereum) return;

    const p = new ethers.BrowserProvider((window as any).ethereum);
    setProvider(p);

    p.getSigner().then((s) => {
      setSigner(s);
      s.getAddress().then(setAccount);
    });
  }, []);

  // ---------------- estimate output ----------------
  useEffect(() => {
    const estimate = async () => {
      if (!amountIn || !getAmountOut) {
        setAmountOut("");
        return;
      }

      try {
        const out = await getAmountOut(
          fromToken.symbol as keyof typeof TOKEN_ADDRESS_MAP,
          toToken.symbol as keyof typeof TOKEN_ADDRESS_MAP,
          amountIn
        );
        setAmountOut(out ?? "");
      } catch (err) {
        console.error("Estimate failed:", err);
        setAmountOut("");
      }
    };

    estimate();
  }, [amountIn, fromToken, toToken, getAmountOut]);

  // ---------------- switch tokens ----------------
  const handleSwitchTokens = async () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);

    // Recalculate output after switch
    if (amountIn && getAmountOut) {
      try {
        const out = await getAmountOut(
          toToken.symbol as keyof typeof TOKEN_ADDRESS_MAP,
          fromToken.symbol as keyof typeof TOKEN_ADDRESS_MAP,
          amountIn
        );
        setAmountOut(out ?? "");
      } catch {
        setAmountOut("");
      }
    }
  };

  // ---------------- handle swap ----------------
  const handleSwap = async () => {
    if (!amountIn || !amountOut || !signer) return;

    try {
      setLoading(true);
      await swapExactTokensForTokens({
        amountIn,
        fromToken: fromToken.symbol as keyof typeof TOKEN_ADDRESS_MAP,
        toToken: toToken.symbol as keyof typeof TOKEN_ADDRESS_MAP,
        to: account,
        slippagePercent: slippage,
      });

      setAmountIn("");
      setAmountOut("");
      alert("Swap successful!");
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
        <div className="logo">
          <img src="/logo.png" alt="FSKSwap" />
          <span>FSKSwap</span>
        </div>
        <nav>
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/farm">Farm</a>
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
          <div className="swap-token-row">
            <div className="swap-token-select">
              <label>From</label>
              <TokenSelect selectedToken={fromToken} onSelect={setFromToken} />
            </div>

            <button
              type="button"
              className="swap-switch-button"
              onClick={handleSwitchTokens}
              title="Switch Tokens"
            >
              ⇅
            </button>

            <div className="swap-token-select">
              <label>To</label>
              <TokenSelect selectedToken={toToken} onSelect={setToToken} />
            </div>
          </div>

          <label>Amount In</label>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />

          <label>Slippage (%)</label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(Number(e.target.value))}
          />

          <p>Estimated Output: {amountOut}</p>

          <button onClick={handleSwap} disabled={loading}>
            {loading ? "Swapping..." : "Swap"}
          </button>
        </div>
      </main>
    </div>
  );
}
