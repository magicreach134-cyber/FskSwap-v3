"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ethers } from "ethers";
import WalletConnectButton from "../../../components/WalletConnectButton";
import ThemeSwitch from "../../../components/ThemeSwitch";
import { FSKLaunchpadABI } from "../../../utils/constants";
import "../styles/launchpad.css";

const LaunchpadProject = () => {
  const params = useParams();
  const presaleAddress = params.id;

  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [presale, setPresale] = useState<any>(null);
  const [contributionAmount, setContributionAmount] = useState("");

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

  // Fetch presale details
  useEffect(() => {
    const fetchPresale = async () => {
      if (!signer || !presaleAddress) return;

      try {
        const contract = new ethers.Contract(presaleAddress, FSKLaunchpadABI, signer);

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
          contract.token(),
          contract.softCap(),
          contract.hardCap(),
          contract.totalRaised(),
          contract.startTime(),
          contract.endTime(),
          contract.contributions(userAddress),
          contract.finalized(),
          contract.name(),
          contract.symbol()
        ]);

        setPresale({ token, softCap, hardCap, totalRaised, startTime, endTime, userContribution, finalized, name, symbol, contract });
      } catch (err) {
        console.error("Error fetching presale:", err);
      }
    };

    fetchPresale();
  }, [signer, userAddress, presaleAddress]);

  const formatTime = (timestamp: number) => {
    const diff = timestamp * 1000 - Date.now();
    if (diff <= 0) return "0d 0h 0m";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleContribute = async () => {
    if (!presale || !contributionAmount || !signer) return;
    try {
      const tx = await presale.contract.contribute({ value: ethers.utils.parseEther(contributionAmount) });
      await tx.wait();
      alert("Contribution successful!");
      setContributionAmount("");
    } catch (err) {
      console.error("Contribution failed:", err);
      alert("Contribution failed. See console.");
    }
  };

  const handleClaim = async () => {
    if (!presale || !signer) return;
    try {
      const tx = await presale.contract.claim();
      await tx.wait();
      alert("Claim successful!");
    } catch (err) {
      console.error("Claim failed:", err);
      alert("Claim failed. See console.");
    }
  };

  if (!presale) return <p className="launchpad-page">Loading presale details...</p>;

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
        <h2>{presale.name} ({presale.symbol}) Presale</h2>
        <p><strong>Token Address:</strong> {presale.token}</p>
        <p><strong>Soft Cap:</strong> {ethers.utils.formatEther(presale.softCap)}</p>
        <p><strong>Hard Cap:</strong> {ethers.utils.formatEther(presale.hardCap)}</p>
        <p><strong>Total Raised:</strong> {ethers.utils.formatEther(presale.totalRaised)}</p>
        <p><strong>Time Left:</strong> {formatTime(presale.endTime)}</p>
        <p><strong>Your Contribution:</strong> {ethers.utils.formatEther(presale.userContribution)}</p>

        {!presale.finalized ? (
          <div>
            <input
              type="number"
              placeholder="Amount in BNB"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
            />
            <button onClick={handleContribute}>Contribute</button>
          </div>
        ) : presale.userContribution > 0 ? (
          <button onClick={handleClaim}>Claim Tokens</button>
        ) : (
          <p>Presale finalized.</p>
        )}
      </main>
    </div>
  );
};

export default LaunchpadProject;
