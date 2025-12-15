// pages/vesting.tsx
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import useLocker from "../hooks/useLocker";
import { TOKEN_COLORS } from "../utils/constants";
import "../styles/swap.css"; // reuse swap styles

const VestingPage = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");
  const [vestingIds, setVestingIds] = useState<number[]>([]);
  const [vestingDetails, setVestingDetails] = useState<any[]>([]);

  const { getBeneficiaryVestings, getVesting, claimVesting } = useLocker(signer);

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setAccount);
    }
  }, []);

  useEffect(() => {
    const fetchVestings = async () => {
      if (!account || !getBeneficiaryVestings) return;

      const ids = await getBeneficiaryVestings(account);
      setVestingIds(ids);

      const details = await Promise.all(ids.map((id) => getVesting(id)));
      setVestingDetails(details);
    };
    fetchVestings();
  }, [account, getBeneficiaryVestings, getVesting]);

  const handleClaim = async (vestId: number) => {
    try {
      await claimVesting(vestId);
      alert(`Successfully claimed vesting ID ${vestId}`);
      // Refresh vesting details
      const details = await Promise.all(vestingIds.map((id) => getVesting(id)));
      setVestingDetails(details);
    } catch (err: any) {
      alert("Claim failed: " + err.message);
    }
  };

  return (
    <div className="swap-page">
      <header className="swap-header">
        <div className="logo">
          <img src="/assets/logo.svg" alt="FSKSwap" />
          <span>FSKSwap Vestings</span>
        </div>
        <nav>
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/staking">Staking</a>
          <a href="/flashswap">FlashSwap</a>
          <a href="/locker">Locker</a>
          <a href="/vesting">Vesting</a>
        </nav>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="swap-container">
        <h2>Your Vestings</h2>

        {vestingDetails.length === 0 && <p>No vestings found for {account}</p>}

        {vestingDetails.map((v, index) => (
          <div key={vestingIds[index]} className="swap-card">
            <p>
              <strong>Vesting ID:</strong> {vestingIds[index]}
            </p>
            <p>
              <strong>Token:</strong>{" "}
              <span style={{ color: TOKEN_COLORS[v.token] || "#fff" }}>{v.token}</span>
            </p>
            <p>
              <strong>Amount:</strong> {v.amount}
            </p>
            <p>
              <strong>Start:</strong> {new Date(v.start * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Duration:</strong> {v.duration} seconds
            </p>
            <p>
              <strong>Claimed:</strong> {v.claimed}
            </p>
            {v.amount > v.claimed && (
              <button onClick={() => handleClaim(vestingIds[index])}>Claim</button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default VestingPage;
