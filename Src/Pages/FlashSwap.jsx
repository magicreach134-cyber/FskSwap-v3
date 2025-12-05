import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import "../style/flashswap.css";
import { flashSwapAddress, FlashSwapABI, TokenList } from "../utils/constants";

const FlashSwap = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenBorrow, setTokenBorrow] = useState(TokenList[0]);
  const [tokenPay, setTokenPay] = useState(TokenList[1]);
  const [amount, setAmount] = useState("");
  const [profitEstimate, setProfitEstimate] = useState("0");

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      setSigner(tempProvider.getSigner());
    }
  }, []);

  useEffect(() => {
    const estimateProfit = async () => {
      if (!signer || !amount || isNaN(amount)) return;
      try {
        const flashSwap = new ethers.Contract(flashSwapAddress, FlashSwapABI, signer);
        const profit = await flashSwap.estimateProfit(
          tokenBorrow.address,
          tokenPay.address,
          ethers.utils.parseUnits(amount, tokenBorrow.decimals)
        );
        setProfitEstimate(ethers.utils.formatUnits(profit, tokenPay.decimals));
      } catch (err) {
        console.error(err);
        setProfitEstimate("0");
      }
    };
    estimateProfit();
  }, [amount, tokenBorrow, tokenPay, signer]);

  const handleFlashSwap = async () => {
    if (!signer) return alert("Connect wallet first");
    try {
      const flashSwap = new ethers.Contract(flashSwapAddress, FlashSwapABI, signer);
      const tx = await flashSwap.executeFlashSwap(
        tokenBorrow.address,
        tokenPay.address,
        ethers.utils.parseUnits(amount, tokenBorrow.decimals)
      );
      await tx.wait();
      alert("FlashSwap executed successfully!");
      setAmount("");
    } catch (err) {
      console.error(err);
      alert("FlashSwap failed: " + err.message);
    }
  };

  const handleSwitch = () => {
    const temp = tokenBorrow;
    setTokenBorrow(tokenPay);
    setTokenPay(temp);
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
        <div className="flashswap-form">
          <div className="input-group">
            <label>Borrow Token</label>
            <select value={tokenBorrow.symbol} onChange={e => setTokenBorrow(TokenList.find(t => t.symbol === e.target.value))}>
              {TokenList.map(t => <option key={t.symbol}>{t.symbol}</option>)}
            </select>
            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>

          <button className="switch-btn" onClick={handleSwitch}>↕</button>

          <div className="input-group">
            <label>Pay Token</label>
            <select value={tokenPay.symbol} onChange={e => setTokenPay(TokenList.find(t => t.symbol === e.target.value))}>
              {TokenList.map(t => <option key={t.symbol}>{t.symbol}</option>)}
            </select>
          </div>

          <p>Estimated Profit: {profitEstimate} {tokenPay.symbol}</p>
          <button onClick={handleFlashSwap}>Execute FlashSwap</button>
        </div>
      </main>
    </div>
  );
};

export default FlashSwap;
