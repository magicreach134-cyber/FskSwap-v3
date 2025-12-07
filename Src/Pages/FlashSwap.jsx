// src/pages/FlashSwap.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import "../style/flashswap.css";
import { flashswapAddress, FlashSwapABI, tokenABIs } from "../utils/constants";

const FlashSwap = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [inputToken, setInputToken] = useState("FSK");
  const [outputToken, setOutputToken] = useState("FUSDT");
  const [amountIn, setAmountIn] = useState("");
  const [estimatedProfit, setEstimatedProfit] = useState("0");

  // Initialize provider and signer
  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setUserAddress);
    }
  }, []);

  // Estimate profit on input change
  useEffect(() => {
    const estimate = async () => {
      if (!signer || !amountIn || parseFloat(amountIn) <= 0) return;
      try {
        const flashSwapContract = new ethers.Contract(flashswapAddress, FlashSwapABI, signer);
        const amountWei = ethers.utils.parseEther(amountIn);

        // Assuming the contract has an estimateProfit function
        const profit = await flashSwapContract.estimateProfit(
          tokenABIs[inputToken].address,
          tokenABIs[outputToken].address,
          amountWei
        );
        setEstimatedProfit(ethers.utils.formatEther(profit));
      } catch (err) {
        console.error("Profit estimation failed:", err);
        setEstimatedProfit("0");
      }
    };
    estimate();
  }, [amountIn, inputToken, outputToken, signer]);

  const handleFlashSwap = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) return alert("Enter a valid amount");

    try {
      const flashSwapContract = new ethers.Contract(flashswapAddress, FlashSwapABI, signer);
      const amountWei = ethers.utils.parseEther(amountIn);

      // Execute flashswap
      const tx = await flashSwapContract.executeFlashSwap(
        tokenABIs[inputToken].address,
        tokenABIs[outputToken].address,
        amountWei
      );

      await tx.wait();
      alert("FlashSwap executed successfully!");
      setAmountIn("");
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

        <div className="flashswap-form">
          <div className="form-row">
            <label>Input Token:</label>
            <select value={inputToken} onChange={(e) => setInputToken(e.target.value)}>
              {Object.keys(tokenABIs).map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Output Token:</label>
            <select value={outputToken} onChange={(e) => setOutputToken(e.target.value)}>
              {Object.keys(tokenABIs).map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Amount:</label>
            <input
              type="number"
              placeholder="Amount in input token"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
          </div>

          <div className="profit-row">
            <strong>Estimated Profit:</strong>{" "}
            <span>{estimatedProfit} {outputToken}</span>
          </div>

          <button onClick={handleFlashSwap}>Execute FlashSwap</button>
        </div>
      </main>
    </div>
  );
};

export default FlashSwap;
