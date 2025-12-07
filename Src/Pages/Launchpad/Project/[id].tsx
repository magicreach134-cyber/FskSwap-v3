"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import WalletConnectButton from "../../../components/WalletConnectButton";
import ThemeSwitch from "../../../components/ThemeSwitch";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI, TOKEN_COLORS } from "../../../utils/constants";
import "../../../styles/launchpad.css";

const PresalePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [presale, setPresale] = useState(null);
  const [contribution, setContribution] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setUserAddress);
    }
  }, []);

  useEffect(() => {
    const fetchPresale = async () => {
      if (!signer || !id) return;

      try {
        const factory = new ethers.Contract(launchpadFactoryAddress, FSKLaunchpadFactoryABI, signer);
        const addresses = await factory.getPresales();
        if (!addresses.includes(id)) return;

        const c = new ethers.Contract(id, [
          "function token() view returns (address)",
          "function softCap() view returns (uint256)",
          "function hardCap() view returns (uint256)",
          "function totalRaised() view returns (uint256)",
          "function startTime() view returns (uint256)",
          "function endTime() view returns (uint256)",
          "function contributions(address) view returns (uint256)",
          "function finalized() view returns (bool)",
          "function name() view returns (string)",
          "function symbol() view returns (string)",
          "function claim()"
        ], signer);

        const [token, softCap, hardCap, totalRaised, startTime, endTime, userContribution, finalized, name, symbol] =
          await Promise.all([
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

        setPresale({ address: id, token, softCap, hardCap, totalRaised, startTime, endTime, userContribution, finalized, name, symbol, contract: c });
      } catch (err) {
        console.error(err);
      }
    };

    fetchPresale();
  }, [signer, userAddress, id]);

  const handleContribute = async () => {
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

  const handleClaim = async () => {
    try {
      const tx = await presale.contract.claim();
      await tx.wait();
      alert("Claim successful!");
    } catch (err) {
      console.error(err);
      alert("Claim failed: " + err.message);
    }
  };

  const formatTime = (ts) => {
    const diff = ts * 1000 - Date.now();
    if (diff <= 0) return "0d 0h 0m";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (!presale) return <p>Loading presale...</p>;

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
        <h2>{presale.name} ({presale.symbol})</h2>
        <p><strong>Token Address:</strong> {presale.token}</p>
        <p><strong>Soft Cap:</strong> {ethers.utils.formatEther(presale.softCap)}</p>
        <p><strong>Hard Cap:</strong> {ethers.utils.formatEther(presale.hardCap)}</p>
        <p><strong>Total Raised:</strong> {ethers.utils.formatEther(presale.totalRaised)}</p>
        <p><strong>Time Left:</strong> {formatTime(presale.endTime)}</p>
        <p><strong>Your Contribution:</strong> {ethers.utils.formatEther(presale.userContribution)}</p>

        {!presale.finalized && (
          <>
            <input
              type="number"
              placeholder="Amount in BNB"
              value={contribution}
              onChange={(e) => setContribution(e.target.value)}
            />
            <button onClick={handleContribute}>Contribute</button>
          </>
        )}

        {presale.finalized && presale.userContribution > 0 && (
          <button onClick={handleClaim}>Claim Tokens</button>
        )}
      </main>
    </div>
  );
};

export default PresalePage;
