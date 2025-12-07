// src/pages/Launchpad.jsx
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import "../style/launchpad.css";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI } from "../utils/constants";
import usePresaleSearch from "../hooks/usePresaleSearch";

const Launchpad = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [presales, setPresales] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [contribution, setContribution] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // active | upcoming
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Load presales from factory
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
              "function claim()",
              "function name() view returns (string)",
              "function symbol() view returns (string)",
            ], signer);

            const [token, softCap, hardCap, totalRaised, startTime, endTime, userContribution, finalized, tokenName, tokenSymbol] = await Promise.all([
              presaleContract.token(),
              presaleContract.softCap(),
              presaleContract.hardCap(),
              presaleContract.totalRaised(),
              presaleContract.startTime(),
              presaleContract.endTime(),
              presaleContract.contributions(userAddress),
              presaleContract.finalized(),
              presaleContract.name ? presaleContract.name() : "Unknown",
              presaleContract.symbol ? presaleContract.symbol() : "UNK"
            ]);

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
              tokenName,
              tokenSymbol,
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

  // Search hook
  const { query, setQuery, filteredPresales } = usePresaleSearch(
    presales.filter((p) => {
      if (activeTab === "active") return p.startTime * 1000 <= currentTime && p.endTime * 1000 >= currentTime;
      if (activeTab === "upcoming") return p.startTime * 1000 > currentTime;
      return true;
    })
  );

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

  // Format countdown for upcoming presales
  const countdown = (timestamp) => {
    const diff = timestamp * 1000 - currentTime;
    if (diff <= 0) return "Starting soon";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="launchpad-page">
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
          <ThemeSwitch />
        </div>
      </header>

      <main className="launchpad-container">
        <div className="launchpad-tabs">
          <button
            className={activeTab === "active" ? "active" : ""}
            onClick={() => setActiveTab("active")}
          >
            Active Presales
          </button>
          <button
            className={activeTab === "upcoming" ? "active" : ""}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Presales
          </button>
        </div>

        <input
          type="text"
          placeholder="Search presales by token name, symbol, or address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="presale-search"
        />

        {filteredPresales.length === 0 && <p>No presales found.</p>}

        {filteredPresales.map((p) => (
          <div key={p.address} className="presale-card">
            <p><strong>Token:</strong> {p.tokenName} ({p.tokenSymbol})</p>
            <p><strong>Soft Cap:</strong> {ethers.utils.formatEther(p.softCap)}</p>
            <p><strong>Hard Cap:</strong> {ethers.utils.formatEther(p.hardCap)}</p>
            <p><strong>Total Raised:</strong> {ethers.utils.formatEther(p.totalRaised)}</p>
            {activeTab === "active" && <p><strong>Time Left:</strong> {countdown(p.endTime)}</p>}
            {activeTab === "upcoming" && <p><strong>Starts In:</strong> {countdown(p.startTime)}</p>}
            <p><strong>Your Contribution:</strong> {ethers.utils.formatEther(p.userContribution)}</p>

            {!p.finalized && activeTab === "active" && (
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
