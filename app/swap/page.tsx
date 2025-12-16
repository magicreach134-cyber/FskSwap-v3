"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import { useSwap } from "../../hooks/useSwap";
import { TOKEN_COLORS, TOKEN_ADDRESS_MAP } from "../../utils/constants";

import ERC20ABI from "../../utils/abis/ERC20.json";
import "../../styles/swap.css";

export default function SwapPage() {
  const [provider, setProvider] =
    useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");

  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");

  const [fromToken, setFromToken] = useState<string>("FSK");
  const [toToken, setToToken] = useState<string>("FUSDT");

  const { getAmountOut, swap } = useSwap(signer);

  /* ---------------- provider / signer ---------------- */
  useEffect(() => {
    if (!(window as any).ethereum) return;

    const p = new ethers.BrowserProvider((window as any).ethereum);
    setProvider(p);

    p.getSigner().then((s) => {
      setSigner(s);
      s.getAddress().then(setAccount);
    });
  }, []);

  /* ---------------- token decimals ---------------- */
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    if (!signer) return 18;
    try {
      const token = new ethers.Contract(tokenAddress, ERC20ABI, signer);
      return await token.decimals();
    } catch {
      return 18;
    }
  };

  /* ---------------- estimate output ---------------- */
  useEffect(() => {
    const estimate = async () => {
      if (!amountIn || !getAmountOut || !signer) return;

      const path = [
        TOKEN_ADDRESS_MAP[fromToken],
        TOKEN_ADDRESS_MAP[toToken],
      ];

      if (!path[0] || !path[1]) return;

      const decimalsIn = await getTokenDecimals(path[0]);
      const out = await getAmountOut(amountIn, path, decimalsIn);

      setAmountOut(out ?? "");
    };

    estimate();
  }, [amountIn, fromToken, toToken, signer, getAmountOut]);

  /* ---------------- execute swap ---------------- */
  const handleSwap = async () => {
    if (!amountIn || !amountOut || !signer) return;

    const path = [
      TOKEN_ADDRESS_MAP[fromToken],
      TOKEN_ADDRESS_MAP[toToken],
    ];

    const decimalsIn = await getTokenDecimals(path[0]);

    try {
      await swap(amountIn, amountOut, path, account, decimalsIn);
      setAmountIn("");
      setAmountOut("");
    } catch (err: any) {
      console.error("Swap failed:", err);
      alert(err?.reason || err?.message || "Swap failed");
    }
  };

  /* ---------------- UI ---------------- */
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
          <WalletConnectButton
            provider={provider}
            setSigner={setSigner}
          />
          <ThemeSwitch />
        </div>
      </header>

      <main className="swap-container">
        <h2>Swap Tokens</h2>

        <div className="swap-card">
          <label>From</label>
          <input
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            style={{ color: TOKEN_COLORS[fromToken] || "#fff" }}
          />

          <label>To</label>
          <input
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            style={{ color: TOKEN_COLORS[toToken] || "#fff" }}
          />

          <label>Amount In</label>
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
}
