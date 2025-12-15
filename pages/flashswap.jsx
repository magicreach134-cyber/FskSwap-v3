"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import { useFlashSwap } from "../hooks/useFlashSwap";
import { TOKEN_COLORS } from "../utils/constants";
import "../styles/flashswap.css";

const FlashSwapPage = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [tokenBorrow, setTokenBorrow] = useState("FSK");
  const [amount, setAmount] = useState("");
  const [estimatedProfit, setEstimatedProfit] = useState("0");

  const { estimateProfit, executeFlashSwap } = useFlashSwap(signer);

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setAccount);
    }
  }, []);

  useEffect(() => {
    const fetchEstimate = async () => {
      if (!amount || !estimateProfit) return;
      try {
        const profit = await estimateProfit(tokenBorrow, amount);
        setEstimatedProfit(profit);
      } catch (err) {
        console.error(err);
        setEstimatedProfit("0");
      }
    };
    fetchEstimate();
  }, [amount, tokenBorrow, estimateProfit]);

  const handleFlashSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert("Enter a valid amount");
    try {
      await executeFlashSwap(tokenBorrow, amount);
      alert("FlashSwap executed successfully!");
      setAmount("");
      setEstimatedProfit("0");
    } catch (err) {
      console.error(err);
      alert("FlashSwap failed: " + err.message);
    }
  };

  return (
    <div className="flashswap-page">
      <header className="flashswap-header">
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

      <main className="flashswap-container">
        <h2>FlashSwap</h2>

        <div className="flashswap-card">
          <label>Token to Borrow</label>
          <input
            type="text"
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
          <p>Estimated Profit: {estimatedProfit}</p>
          <button onClick={handleFlashSwap}>Execute FlashSwap</button>
        </div>
      </main>
    </div>
  );
};

export default FlashSwapPage;
