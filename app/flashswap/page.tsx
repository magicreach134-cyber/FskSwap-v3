"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeSwitch from "@/components/ThemeSwitch";
import useFlashSwap from "@/hooks/useFlashSwap";

import {
  TOKENS,
  CONTRACTS,
  TOKEN_COLORS,
} from "@/utils/constants";

export default function FlashSwapPage() {
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const [amount, setAmount] = useState<string>("");
  const [estimatedProfit, setEstimatedProfit] = useState<string>("0");
  const [bestRouter, setBestRouter] = useState<string>("");

  const tokenBorrow = TOKENS.FSK;     // address
  const tokenTarget = TOKENS.WBNB;    // address

  const routers = [
    CONTRACTS.FSKRouterV3,
  ];

  const path = [
    tokenBorrow,
    tokenTarget,
  ];

  const { estimateBestRouter, executeFlashSwap } = useFlashSwap(signer);

  /* ---------- WALLET ---------- */
  useEffect(() => {
    if (!window.ethereum) return;

    const init = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setSigner(signer);
    };

    init();
  }, []);

  /* ---------- PROFIT ESTIMATION ---------- */
  useEffect(() => {
    if (!amount || Number(amount) <= 0 || !estimateBestRouter) {
      setEstimatedProfit("0");
      return;
    }

    const estimate = async () => {
      try {
        const result = await estimateBestRouter(
          amount,
          routers,
          path
        );

        setEstimatedProfit(result.maxProfit);
        setBestRouter(result.bestRouter);
      } catch {
        setEstimatedProfit("0");
        setBestRouter("");
      }
    };

    estimate();
  }, [amount]);

  /* ---------- EXECUTION ---------- */
  const handleFlashSwap = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Invalid amount");
      return;
    }

    if (Number(estimatedProfit) <= 0) {
      alert("Trade not profitable");
      return;
    }

    try {
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
    } catch (err: any) {
      alert(err?.message || "FlashSwap failed");
    }
  };

  return (
    <div className="flashswap-page">
      {/* HEADER */}
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
          <WalletConnectButton />
          <ThemeSwitch />
        </div>
      </header>

      {/* MAIN */}
      <main className="flashswap-container">
        <h2>FlashSwap</h2>

        <div className="flashswap-card">
          <label>Borrow Token</label>
          <input
            value="FSK"
            disabled
            style={{ color: TOKEN_COLORS.FSK }}
          />

          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <p>
            Estimated Profit:&nbsp;
            <strong
              style={{
                color:
                  Number(estimatedProfit) > 0 ? "#00ff99" : "#ff4444",
              }}
            >
              {estimatedProfit}
            </strong>
          </p>

          <button onClick={handleFlashSwap}>
            Execute FlashSwap
          </button>
        </div>
      </main>
    </div>
  );
}
