import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import { useSwap } from "../hooks/useSwap";
import { TOKEN_COLORS } from "../utils/constants";
import { TOKENS } from "../utils/tokens";
import "../styles/swap.css";

const Swap = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");

  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [fromToken, setFromToken] = useState("FSK");
  const [toToken, setToToken] = useState("FUSDT");

  const { getAmountOut, swap } = useSwap(signer);

  /* ---------- Init provider ---------- */
  useEffect(() => {
    if (!window.ethereum) return;

    const p = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(p);
  }, []);

  /* ---------- Load account ---------- */
  useEffect(() => {
    if (!provider) return;

    provider.listAccounts().then((accounts) => {
      if (accounts.length > 0) {
        setSigner(provider.getSigner());
        setAccount(accounts[0]);
      }
    });
  }, [provider]);

  /* ---------- Quote output ---------- */
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amountIn || !getAmountOut) return;
      if (!TOKENS[fromToken] || !TOKENS[toToken]) return;

      try {
        const amountParsed = ethers.utils.parseUnits(
          amountIn,
          TOKENS[fromToken].decimals
        );

        const path = [
          TOKENS[fromToken].address,
          TOKENS[toToken].address,
        ];

        const out = await getAmountOut(amountParsed, path);

        setAmountOut(
          ethers.utils.formatUnits(out, TOKENS[toToken].decimals)
        );
      } catch {
        setAmountOut("");
      }
    };

    fetchQuote();
  }, [amountIn, fromToken, toToken, getAmountOut]);

  /* ---------- Execute swap ---------- */
  const handleSwap = async () => {
    if (!signer || !account) return;
    if (!amountIn || !amountOut) return;

    const amountParsed = ethers.utils.parseUnits(
      amountIn,
      TOKENS[fromToken].decimals
    );

    const minOut = ethers.utils.parseUnits(
      amountOut,
      TOKENS[toToken].decimals
    );

    const path = [
      TOKENS[fromToken].address,
      TOKENS[toToken].address,
    ];

    await swap(amountParsed, minOut, path, account);

    setAmountIn("");
    setAmountOut("");
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

          <label>Amount</label>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />

          <p>Estimated Output: {amountOut}</p>

          <button onClick={handleSwap} disabled={!account}>
            Swap
          </button>
        </div>
      </main>
    </div>
  );
};

export default Swap;
