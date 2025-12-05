import { useState, useEffect } from "react";
import TokenSelect from "../components/TokenSelect";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import { ethers } from "ethers";
import "../style/swap-form.css";
import { IFSKRouterABI, routerAddress } from "../utils/constants";

const Swap = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountA, setAmountA] = useState("");
  const [estimated, setEstimated] = useState("0");
  const [slippage, setSlippage] = useState(0.5);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deadline] = useState(Math.floor(Date.now() / 1000) + 1800);

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      setSigner(tempProvider.getSigner());
    }
  }, []);

  useEffect(() => {
    if (!signer || !amountA || !tokenA || !tokenB) return;

    const estimate = async () => {
      try {
        const router = new ethers.Contract(routerAddress, IFSKRouterABI, signer);
        const path = [tokenA.address, tokenB.address];
        const amounts = await router.getAmountsOut(
          ethers.utils.parseUnits(amountA, tokenA.decimals),
          path
        );
        setEstimated(ethers.utils.formatUnits(amounts[1], tokenB.decimals));
      } catch (err) {
        console.error(err);
      }
    };
    estimate();
  }, [amountA, tokenA, tokenB, signer]);

  const handleSwap = async () => {
    if (!signer) return alert("Connect wallet first");
    try {
      const router = new ethers.Contract(routerAddress, IFSKRouterABI, signer);
      const path = [tokenA.address, tokenB.address];
      const amountIn = ethers.utils.parseUnits(amountA, tokenA.decimals);
      const minOut = ethers.utils.parseUnits(
        (parseFloat(estimated) * (1 - slippage / 100)).toString(),
        tokenB.decimals
      );
      const tx = await router.swapExactTokensForTokens(
        amountIn,
        minOut,
        path,
        await signer.getAddress(),
        deadline
      );
      await tx.wait();
      alert("Swap completed!");
      setAmountA("");
    } catch (err) {
      console.error(err);
      alert("Swap failed: " + err.message);
    }
  };

  const handleSwitch = () => {
    const temp = tokenA;
    setTokenA(tokenB);
    setTokenB(temp);
  };

  return (
    <div className="swap-page">
      <header>
        <img src="/assets/logo.svg" alt="FSKSwap" />
        <nav>
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/staking">Staking</a>
          <a href="/flashswap">FlashSwap</a>
        </nav>
        <WalletConnectButton provider={provider} setSigner={setSigner} />
        <ThemeSwitch />
      </header>

      <main>
        <div className="swap-form">
          <h2>Swap Tokens</h2>
          <TokenSelect selectedToken={tokenA} setToken={setTokenA} />
          <input type="number" placeholder="Amount" value={amountA} onChange={(e) => setAmountA(e.target.value)} />

          <button onClick={handleSwitch}>↕</button>

          <TokenSelect selectedToken={tokenB} setToken={setTokenB} />
          <input type="text" placeholder={estimated} disabled />

          <input type="number" value={slippage} onChange={(e) => setSlippage(parseFloat(e.target.value))} min="0" max="10" step="0.1" />
          <button onClick={() => setShowConfirm(true)}>Confirm Swap</button>

          {showConfirm && (
            <div className="modal">
              <p>Swap {amountA} {tokenA?.symbol} → ~{estimated} {tokenB?.symbol}</p>
              <button onClick={() => { handleSwap(); setShowConfirm(false); }}>Confirm</button>
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Swap;
