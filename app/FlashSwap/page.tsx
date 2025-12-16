"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeSwitch from "@/components/ThemeSwitch";
import { useFlashSwap } from "@/hooks/useFlashSwap";
import { TOKEN_COLORS } from "@/utils/constants";

export default function FlashSwapPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");

  const [tokenBorrow, setTokenBorrow] = useState<string>("FSK");
  const [amount, setAmount] = useState<string>("");
  const [estimatedProfit, setEstimatedProfit] = useState<string>("0");

  const { estimateProfit, executeFlashSwap } = useFlashSwap(signer);

  /* ---------- WALLET INIT ---------- */
  useEffect(() => {
    if (!window.ethereum) return;

    const init = async () => {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(address);
    };

    init();
  }, []);

  /* ---------- PROFIT ESTIMATION ---------- */
  useEffect(() => {
    if (!amount || !estimateProfit) {
      setEstimatedProfit("0");
      return;
    }

    const runEstimate = async () => {
      try {
        const profit = await estimateProfit(tokenBorrow, amount);
        setEstimatedProfit(profit);
      } catch {
        setEstimatedProfit("0");
      }
    };

    runEstimate();
  }, [amount, tokenBorrow, estimateProfit]);

  /* ---------- EXECUTION ---------- */
  const handleFlashSwap = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (Number(estimatedProfit) <= 0) {
      alert("Trade not profitable");
      return;
    }

    try {
      await executeFlashSwap(tokenBorrow, amount);
      alert("FlashSwap executed successfully");
      setAmount("");
      setEstimatedProfit("0");
    } catch (err: any) {
      alert(`FlashSwap failed: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="flashswap-page">
      {/* ---------- HEADER ---------- */}
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

      {/* ---------- MAIN ---------- */}
      <main className="flashswap-container">
        <h2>FlashSwap</h2>

        <div className="flashswap-card">
          <label>Token to Borrow</label>
          <input
            value={tokenBorrow}
            onChange={(e) => setTokenBorrow(e.target.value)}
            style={{ color: TOKEN_COLORS[tokenBorrow] || "#fff" }}
          />

          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <p>
            Estimated Profit:{" "}
            <strong
              style={{
                color:
                  Number(estimatedProfit) > 0 ? "#00ff99" : "#ff4444",
              }}
            >
              {estimatedProfit}
            </strong>
          </p>

          <button onClick={handleFlashSwap}>Execute FlashSwap</button>
        </div>
      </main>
    </div>
  );
}
