"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";

import ThemeSwitch from "@/components/ThemeSwitch";
import useFlashSwap from "@/hooks/useFlashSwap";

import { TOKENS, CONTRACTS, TOKEN_COLORS } from "@/utils/constants";

export default function FlashSwapPage() {
  const { isConnected } = useAccount();

  const { estimateBestRouter, executeFlashSwap } = useFlashSwap();

  const [amount, setAmount] = useState("");
  const [estimatedProfit, setEstimatedProfit] = useState("0");
  const [bestRouter, setBestRouter] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);

  const tokenBorrow = TOKENS.FSK;
  const tokenTarget = TOKENS.WBNB;
  const routers = [CONTRACTS.FSKRouterV3];
  const path = [tokenBorrow, tokenTarget];

  /* ---------- Estimate Profit ---------- */
  const updateEstimation = useCallback(async () => {
    if (!amount || Number(amount) <= 0 || !estimateBestRouter) {
      setEstimatedProfit("0");
      setBestRouter("");
      return;
    }

    try {
      setEstimating(true);
      const result = await estimateBestRouter(amount, routers, path);
      setEstimatedProfit(result.maxProfit);
      setBestRouter(result.bestRouter);
    } catch (err) {
      console.error("Profit estimation failed:", err);
      setEstimatedProfit("0");
      setBestRouter("");
    } finally {
      setEstimating(false);
    }
  }, [amount, estimateBestRouter, routers, path]);

  useEffect(() => {
    const timer = setTimeout(updateEstimation, 400);
    return () => clearTimeout(timer);
  }, [updateEstimation]);

  /* ---------- Execute FlashSwap ---------- */
  const handleFlashSwap = async () => {
    if (!isConnected) return alert("Connect wallet first");
    if (!amount || Number(amount) <= 0) return alert("Invalid amount");
    if (Number(estimatedProfit) <= 0) return alert("Trade not profitable");

    try {
      setLoading(true);
      await executeFlashSwap(
        tokenBorrow,
        amount,
        tokenTarget,
        routers,
        path
      );

      alert("FlashSwap executed successfully");
      setAmount("");
      setEstimatedProfit("0");
      setBestRouter("");
    } catch (err: any) {
      console.error("FlashSwap failed:", err);
      alert(err?.message || "FlashSwap failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flashswap-page">
      <header className="flashswap-header">
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
          <ThemeSwitch />
        </div>
      </header>

      <main className="flashswap-container">
        <h2>FlashSwap</h2>

        <div className={`flashswap-card ${loading ? "loading" : ""}`}>
          <label>Borrow Token</label>
          <input value="FSK" disabled style={{ color: TOKEN_COLORS.FSK }} />

          <label>Amount</label>
          <input
            type="number"
            value={amount}
            min="0"
            step="any"
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />

          <p>
            Estimated Profit:&nbsp;
            <strong
              style={{
                color:
                  Number(estimatedProfit) > 0 ? "#00ff99" : "#ff4444",
              }}
            >
              {estimating ? "Estimating..." : estimatedProfit}
            </strong>
          </p>

          <button
            onClick={handleFlashSwap}
            disabled={loading || estimating || Number(amount) <= 0}
          >
            {loading ? "Executing..." : "Execute FlashSwap"}
          </button>
        </div>

        {bestRouter && (
          <p>
            Best Router:&nbsp;
            <strong>{bestRouter}</strong>
          </p>
        )}
      </main>
    </div>
  );
}
