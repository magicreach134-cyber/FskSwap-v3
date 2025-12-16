"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import TokenSelect from "../../components/TokenSelect";
import { useSwap } from "../../hooks/useSwap";
import { TOKEN_LIST, TOKEN_ADDRESS_MAP, TOKEN_COLORS, APP_CONSTANTS } from "../../utils/constants";
import ERC20ABI from "../../utils/abis/ERC20.json";

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

      const path = [TOKEN_ADDRESS_MAP[fromToken.symbol], TOKEN_ADDRESS_MAP[toToken.symbol]];
      if (!path[0] || !path[1]) return;

      const decimalsIn = await getTokenDecimals(path[0]);
      const decimalsOut = await getTokenDecimals(path[1]);
      try {
        const out = await getAmountOut(amountIn, path, decimalsIn);
        setAmountOut(out ? Number(out).toFixed(decimalsOut) : "");
      } catch (err) {
        console.error("Estimate failed:", err);
        setAmountOut("");
      }
    };

    estimate();
  }, [amountIn, fromToken, toToken, signer, getAmountOut]);

  /* ---------------- execute swap ---------------- */
  const handleSwap = async () => {
    if (!amountIn || !amountOut || !signer) return;

    const path = [TOKEN_ADDRESS_MAP[fromToken.symbol], TOKEN_ADDRESS_MAP[toToken.symbol]];
    const decimalsIn = await getTokenDecimals(path[0]);

    try {
      setLoading(true);
      await swap(amountIn, amountOut, path, account, decimalsIn, slippage);
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
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="swap-container">
        <h2>Swap Tokens</h2>

        <div className="swap-card">
          <label>From</label>
          <TokenSelect selectedToken={fromToken} onSelect={setFromToken} />

          <label>To</label>
          <TokenSelect selectedToken={toToken} onSelect={setToToken} />

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
