"use client";

import { ethers } from "ethers";

const PresaleCard = ({ presale, contribution, setContribution, onContribute, onClaim, tokenColors }) => {
  const formatTime = (ts) => {
    const diff = ts * 1000 - Date.now();
    if (diff <= 0) return "0d 0h 0m";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="presale-card">
      <p>
        <strong>Token:</strong>{" "}
        <span style={{ color: tokenColors[presale.symbol] || "#fff" }}>
          {presale.name} ({presale.symbol})
        </span>
      </p>
      <p><strong>Token Address:</strong> {presale.token}</p>
      <p><strong>Soft Cap:</strong> {ethers.utils.formatEther(presale.softCap)}</p>
      <p><strong>Hard Cap:</strong> {ethers.utils.formatEther(presale.hardCap)}</p>
      <p><strong>Total Raised:</strong> {ethers.utils.formatEther(presale.totalRaised)}</p>
      <p><strong>Time Left:</strong> {formatTime(presale.endTime)}</p>
      <p><strong>Your Contribution:</strong> {ethers.utils.formatEther(presale.userContribution)}</p>

      {!presale.finalized && presale.status === "active" && (
        <>
          <input
            type="number"
            placeholder="Amount in BNB"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
          />
          <button onClick={() => onContribute(presale)}>Contribute</button>
        </>
      )}

      {presale.finalized && presale.userContribution > 0 && (
        <button onClick={() => onClaim(presale)}>Claim Tokens</button>
      )}
    </div>
  );
};

export default PresaleCard;
