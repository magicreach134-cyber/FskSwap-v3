"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import usePresaleSearch from "../../hooks/usePresaleSearch";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI, TOKEN_COLORS } from "../../utils/constants";
import "../../styles/launchpad.css";

const LaunchpadList = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [presales, setPresales] = useState<any[]>([]);

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

  // Fetch presales from factory
  useEffect(() => {
    const fetchPresales = async () => {
      if (!signer) return;

      try {
        const factory = new ethers.Contract(launchpadFactoryAddress, FSKLaunchpadFactoryABI, signer);
        const addresses: string[] = await factory.getPresales();

        const details = await Promise.all(
          addresses.map(async (addr) => {
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

            const [
              token,
              softCap,
              hardCap,
              totalRaised,
              startTime,
              endTime,
              userContribution,
              finalized,
              name,
              symbol
            ] = await Promise.all([
              presaleContract.token(),
              presaleContract.softCap(),
              presaleContract.hardCap(),
              presaleContract.totalRaised(),
              presaleContract.startTime(),
              presaleContract.endTime(),
              presaleContract.contributions(userAddress),
              presaleContract.finalized(),
              presaleContract.name(),
              presaleContract.symbol()
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
              name, 
              symbol, 
              contract: presaleContract 
            };
          })
        );

        setPresales(details);
      } catch (err) {
        console.error("Error fetching presales:", err);
      }
    };

    fetchPresales();
  }, [signer, userAddress]);

  const { query, setQuery, filteredPresales } = usePresaleSearch(presales);

  const formatTime = (timestamp: number) => {
    const diff = timestamp * 1000 - Date.now();
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
        <h2>All Presales</h2>

        <input
          type="text"
          placeholder="Search by token, symbol, or address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {filteredPresales.length === 0 ? (
          <p>No presales found.</p>
        ) : (
          filteredPresales.map((p, idx) => (
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

              {p.finalized && p.userContribution > 0 && (
                <a href={`/launchpad/project/${p.address}`}>
                  <button>Claim / View</button>
                </a>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default LaunchpadList;
