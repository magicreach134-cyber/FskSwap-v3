"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import usePresaleSearch from "../../hooks/usePresaleSearch";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI, TOKEN_COLORS } from "../../utils/constants";
import "../../styles/launchpad.css";

const Launchpad = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [presales, setPresales] = useState([]);
  const [contribution, setContribution] = useState("");

  // Initialize provider and signer
  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setUserAddress);

      // Optional: refresh presales on account change
      window.ethereum.on("accountsChanged", (accounts) => {
        setUserAddress(accounts[0] || "");
      });
    }
  }, []);

  // Load presales from factory
  useEffect(() => {
    const fetchPresales = async () => {
      if (!signer) return;

      try {
        const factory = new ethers.Contract(launchpadFactoryAddress, FSKLaunchpadFactoryABI, signer);
        const addresses = await factory.getPresales();

        const details = await Promise.all(
          addresses.map(async (addr) => {
            const c = new ethers.Contract(addr, [
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

            const [
              token, softCap, hardCap, totalRaised,
              startTime, endTime, userContribution,
              finalized, name, symbol
            ] = await Promise.all([
              c.token(),
              c.softCap(),
              c.hardCap(),
              c.totalRaised(),
              c.startTime(),
              c.endTime(),
              c.contributions(userAddress),
              c.finalized(),
              c.name(),
              c.symbol()
            ]);

            const now = Math.floor(Date.now() / 1000);
            const status = now < startTime ? "upcoming" : now >= startTime && now <= endTime ? "active" : "ended";

            return { address: addr, token, softCap, hardCap, totalRaised, startTime, endTime, userContribution, finalized, name, symbol, status, contract: c };
          })
        );

        setPresales(details);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPresales();
  }, [signer, userAddress]);

  // Use search + status filter hook
  const { query, setQuery, filteredPresales, statusFilter, setStatusFilter } = usePresaleSearch(presales, "active");

  // Contribute to presale
  const handleContribute = async (presale) => {
    if (!contribution || parseFloat(contribution) <= 0) return alert("Enter a valid amount");
    try {
      const tx = await presale.contract.contribute({ value: ethers.utils.parseEther(contribution) });
      await tx.wait();
      alert("Contribution successful!");
      setContribution("");
    } catch (err) {
      console.error(err);
      alert("Contribution failed: " + err.message);
    }
  };

  // Claim tokens after presale
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

  // Format remaining time
  const formatTime = (ts) => {
    const diff = ts * 1000 - Date.now();
    if (diff <= 0) return "0d 0h 0m";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
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
        <h2>Presales</h2>

        <div className="presale-controls">
          <input
            type="text"
            placeholder="Search by token, symbol, or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="tabs">
            {["active", "upcoming", "ended", "all"].map((status) => (
              <button
                key={status}
                className={statusFilter === status ? "active" : ""}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredPresales.length === 0 && <p>No presales found.</p>}

        {filteredPresales.map((p, idx) => (
          <div key={idx} className="presale-card">
            <p>
              <strong>Token:</strong>{" "}
              <span style={{ color: TOKEN_COLORS[p.symbol] || "#fff" }}>
                {p.name} ({p.symbol})
              </span>
            </p>
            <p><strong>Token Address:</strong> {p.token}</p>
            <p><strong>Soft Cap:</strong> {ethers.utils.formatEther(p.softCap)}</p>
            <p><strong>Hard Cap:</strong> {ethers.utils.formatEther(p.hardCap)}</p>
            <p><strong>Total Raised:</strong> {ethers.utils.formatEther(p.totalRaised)}</p>
            <p><strong>Time Left:</strong> {formatTime(p.endTime)}</p>
            <p><strong>Your Contribution:</strong> {ethers.utils.formatEther(p.userContribution)}</p>

            {!p.finalized && p.status === "active" && (
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
