"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import { useSwap } from "../hooks/useSwap";
import { TOKEN_COLORS } from "../utils/constants";
import "../styles/swap.css";
import ERC20ABI from "../utils/abis/ERC20.json";

const Swap = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [fromToken, setFromToken] = useState<string>("FSK");
  const [toToken, setToToken] = useState<string>("FUSDT");

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

  // Helper: fetch token decimals
  const getTokenDecimals = async (tokenAddress: string) => {
    if (!signer) return 18;
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);
      return await tokenContract.decimals();
    } catch (err) {
      console.error("getTokenDecimals error:", err);
      return 18;
    }
  };

  useEffect(() => {
    const fetchOut = async () => {
      if (!amountIn || !getAmountOut) return;

      // Replace these with actual token addresses mapping
      const tokenAddressMap: Record<string, string> = {
        FSK: "0xYourFSKAddress",
        FUSDT: "0xYourFUSDTAddress",
        BTC: "0xYourBTCAddress",
      };

      const path = [tokenAddressMap[fromToken], tokenAddressMap[toToken]];

      const decimalsIn = await getTokenDecimals(path[0]);
      const decimalsOut = await getTokenDecimals(path[1]);

      const out = await getAmountOut(amountIn, path, decimalsIn);
      setAmountOut(out ? parseFloat(out).toFixed(decimalsOut) : "");
    };
    fetchOut();
  }, [amountIn, fromToken, toToken, getAmountOut, signer]);

  const handleSwap = async () => {
    if (!amountIn || !amountOut) return;

    const tokenAddressMap: Record<string, string> = {
      FSK: "0xYourFSKAddress",
      FUSDT: "0xYourFUSDTAddress",
      BTC: "0xYourBTCAddress",
    };

    const path = [tokenAddressMap[fromToken], tokenAddressMap[toToken]];

    const decimalsIn = await getTokenDecimals(path[0]);
    const decimalsOut = await getTokenDecimals(path[1]);

    try {
      await swap(amountIn, amountOut, path, account, decimalsIn);
      alert("Swap successful!");
      setAmountIn("");
      setAmountOut("");
    } catch (err: any) {
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
