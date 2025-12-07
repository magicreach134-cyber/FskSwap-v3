// src/pages/Swap.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import TokenSelect from "../components/TokenSelect";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import "../style/swap-form.css";
import { 
  FSKFactoryABI, FSKRouterABI, FSKFactoryAddress, FSKRouterAddress 
} from "../utils/constants";

const Swap = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [slippage, setSlippage] = useState(0.5); // default 0.5%
  const [userAddress, setUserAddress] = useState("");

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

  // Estimate output
  useEffect(() => {
    const estimate = async () => {
      if (!fromToken || !toToken || !amountIn || !signer) return;
      try {
        const router = new ethers.Contract(FSKRouterAddress, FSKRouterABI, signer);
        const amountsOut = await router.getAmountsOut(
          ethers.utils.parseUnits(amountIn, fromToken.decimals),
          [fromToken.address, toToken.address]
        );
        setAmountOut(ethers.utils.formatUnits(amountsOut[1], toToken.decimals));
      } catch (err) {
        console.error(err);
        setAmountOut("0");
      }
    };
    estimate();
  }, [fromToken, toToken, amountIn, signer]);

  const handleSwap = async () => {
    if (!fromToken || !toToken || !amountIn || !signer) return alert("Complete swap details");
    try {
      const router = new ethers.Contract(FSKRouterAddress, FSKRouterABI, signer);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 min
      const amountInWei = ethers.utils.parseUnits(amountIn, fromToken.decimals);
      const amountsOutMin = ethers.utils.parseUnits(
        (parseFloat(amountOut) * (1 - slippage / 100)).toFixed(toToken.decimals),
        toToken.decimals
      );

      let tx;
      if (fromToken.symbol === "BNB") {
        tx = await router.swapExactETHForTokens(
          amountsOutMin,
          [fromToken.address, toToken.address],
          userAddress,
          deadline,
          { value: amountInWei }
        );
      } else if (toToken.symbol === "BNB") {
        const tokenContract = new ethers.Contract(fromToken.address, [
          "function approve(address spender, uint256 amount) public returns (bool)"
        ], signer);
        await tokenContract.approve(FSKRouterAddress, amountInWei);
        tx = await router.swapExactTokensForETH(
          amountInWei,
          amountsOutMin,
          [fromToken.address, toToken.address],
          userAddress,
          deadline
        );
      } else {
        const tokenContract = new ethers.Contract(fromToken.address, [
          "function approve(address spender, uint256 amount) public returns (bool)"
        ], signer);
        await tokenContract.approve(FSKRouterAddress, amountInWei);
        tx = await router.swapExactTokensForTokens(
          amountInWei,
          amountsOutMin,
          [fromToken.address, toToken.address],
          userAddress,
          deadline
        );
      }
      await tx.wait();
      alert("Swap successful!");
      setAmountIn("");
      setAmountOut("");
    } catch (err) {
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
        <div className="swap-form">
          <TokenSelect 
            label="From" 
            selected={fromToken} 
            setSelected={setFromToken} 
            highlightFSK="yellow" 
            highlightFUSDT="red"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />
          <TokenSelect 
            label="To" 
            selected={toToken} 
            setSelected={setToToken} 
            highlightFSK="yellow" 
            highlightFUSDT="red"
          />
          <p>Estimated: {amountOut}</p>
          <input
            type="number"
            placeholder="Slippage %"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
          />
          <button onClick={handleSwap}>Swap</button>
        </div>
      </main>
    </div>
  );
};

export default Swap;
