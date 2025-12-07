"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import { useTheme } from "../hooks/useTheme";
import usePresaleSearch from "../hooks/usePresaleSearch";
import { useDebounce } from "../hooks/useDebounce";
import "../style/launchpad.css";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI } from "../utils/constants";

const Launchpad = () => {
  const { theme, toggleTheme } = useTheme();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [presales, setPresales] = useState([]);
  const [contribution, setContribution] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showActive, setShowActive] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initialize ethers provider
  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setUserAddress);
    }
  }, []);

  // Fetch presales from factory
  useEffect(() => {
    const fetchPresales = async () => {
      if (!signer) return;
      try {
        const factory = new ethers.Contract(
          launchpadFactoryAddress,
          FSKLaunchpadFactoryABI,
          signer
        );
        const presaleAddresses = await factory.getPresales();
        const presaleDetails = await Promise.all(
          presaleAddresses.map(async (addr) => {
            const presaleContract = new ethers.Contract(addr, [
              "function token() view returns (address)",
              "function softCap() view returns (uint256)",
              "function hardCap() view returns (uint256)",
              "function totalRaised() view returns (uint256)",
              "function startTime() view returns (uint256)",
              "function endTime() view returns (uint256)",
              "function contributions(address) view returns (uint256)",
              "function finalized() view returns (bool)",
              "function name() view returns (string)",
              "function symbol() view returns (string)"
            ], signer);

            const token = await presaleContract.token();
            const softCap = await presaleContract.softCap();
            const hardCap = await presaleContract.hardCap();
            const totalRaised = await presaleContract.totalRaised();
            const startTime = await presaleContract.startTime();
            const endTime = await presaleContract.endTime();
            const userContribution = await presaleContract.contributions(userAddress);
            const finalized = await presaleContract.finalized();
            const name = await presaleContract.name();
            const symbol = await presaleContract.symbol();

            return {
              address: addr,
              token,
              softCap,
              hardCap,
              totalRaised,
              startTime,
              endTime,
              userContribution,
              finalized,
              contract: presaleContract,
              name,
              symbol
            };
          })
        );
        setPresales(presaleDetails);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPresales();
  }, [signer, userAddress]);

  const filteredPresales = usePresaleSearch(presales, debouncedSearchTerm, showActive);

  const handleContribute = async (presale) => {
    if (!contribution || parseFloat(contribution) <= 0) return alert("Enter a valid amount");
    try {
      const tx = await presale.contract.contribute({
        value: ethers.utils.parseEther(contribution),
      });
      await tx.wait();
      alert("Contribution successful!");
      setContribution("");
    } catch (err) {
      console.error(err);
      alert("Contribution failed: " + err.message);
    }
  };

  const handleClaim = async (presale) => {
    try {
      const tx = await presale.contract.claim();
      await tx.wait();
      alert("Claim successful!");
    } catch (err) {
      console.error(err);
      alert("Claim failed: " + err.message);
    }
  };

  const formatTime = (timestamp) => {
    const diff = timestamp * 1000 - Date.now();
    if (diff <= 0) return "0d 0h 0m";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className={`launchpad-page ${theme}`}>
      <header className="launchpad-header">
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
          <button onClick={toggleTheme}>{theme === "light" ? "🌞" : "🌙"}</button>
        </div>
      </header>

      <main className="launchpad-container">
        <h2>Presales</h2>

        <div className="presale-controls">
          <input
            type="text"
            placeholder="Search by token, symbol, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="tabs">
            <button
              className={showActive ? "active" : ""}
              onClick={() => setShowActive(true)}
            >
              Active
            </button>
            <button
              className={!showActive ? "active" : ""}
              onClick={() => setShowActive(false)}
            >
              Upcoming
            </button>
          </div>
        </div>

        {filteredPresales.length === 0 && <p>No presales found.</p>}
        {filteredPresales.map((p, idx) => (
          <div key={idx} className="presale-card">
            <p><strong>Token:</strong> {p.name} ({p.symbol})</p>
            <p><strong>Token Address:</strong> {p.token}</p>
            <p><strong>Soft Cap:</strong> {ethers.utils.formatEther(p.softCap)}</p>
            <p><strong>Hard Cap:</strong> {ethers.utils.formatEther(p.hardCap)}</p>
            <p><strong>Total Raised:</strong> {ethers.utils.formatEther(p.totalRaised)}</p>
            <p><strong>Time Left:</strong> {formatTime(p.endTime)}</p>
            <p><strong>Your Contribution:</strong> {ethers.utils.formatEther(p.userContribution)}</p>

            {!p.finalized && (
              <>
                <input
                  type="number"
                  placeholder="Amount in BNB"
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                />
                <button onClick={() => handleContribute(p)}>Contribute</button>
              </>
            )}

            {p.finalized && p.userContribution > 0 && (
              <button onClick={() => handleClaim(p)}>Claim Tokens</button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default Launchpad;
