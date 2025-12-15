// pages/locker.tsx
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import useLocker from "../hooks/useLocker";
import { TOKEN_COLORS } from "../utils/constants";
import "../styles/swap.css"; // reuse swap styles

const LockerPage = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");
  const [locks, setLocks] = useState<number[]>([]);
  const [lockDetails, setLockDetails] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  const { getOwnerLocks, getLock, withdrawFromLock } = useLocker(signer);

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
    const fetchLocks = async () => {
      if (!account || !getOwnerLocks) return;
      const ids = await getOwnerLocks(account);
      setLocks(ids);

      const details = await Promise.all(ids.map((id) => getLock(id)));
      setLockDetails(details);
    };
    fetchLocks();
  }, [account, getOwnerLocks, getLock]);

  const handleWithdraw = async (lockId: number) => {
    if (!withdrawAmount) return;
    try {
      await withdrawFromLock(lockId, account, withdrawAmount);
      alert(`Successfully withdrew ${withdrawAmount} tokens from lock ${lockId}`);
      setWithdrawAmount("");
      // Refresh lock details
      const details = await Promise.all(locks.map((id) => getLock(id)));
      setLockDetails(details);
    } catch (err: any) {
      alert("Withdraw failed: " + err.message);
    }
  };

  return (
    <div className="swap-page">
      <header className="swap-header">
        <div className="logo">
          <img src="/assets/logo.svg" alt="FSKSwap" />
          <span>FSKSwap Locker</span>
        </div>
        <nav>
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/staking">Staking</a>
          <a href="/flashswap">FlashSwap</a>
          <a href="/locker">Locker</a>
        </nav>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="swap-container">
        <h2>Your Locked Tokens</h2>

        {lockDetails.length === 0 && <p>No locks found for {account}</p>}

        {lockDetails.map((lock, index) => (
          <div key={locks[index]} className="swap-card">
            <p>
              <strong>Lock ID:</strong> {locks[index]}
            </p>
            <p>
              <strong>Token:</strong>{" "}
              <span style={{ color: TOKEN_COLORS[lock.token] || "#fff" }}>{lock.token}</span>
            </p>
            <p>
              <strong>Amount:</strong> {lock.amount}
            </p>
            <p>
              <strong>Unlock Time:</strong>{" "}
              {new Date(lock.unlockTime * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Withdrawn:</strong> {lock.withdrawn ? "Yes" : "No"}
            </p>
            {!lock.withdrawn && (
              <>
                <input
                  type="number"
                  placeholder="Amount to withdraw"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <button onClick={() => handleWithdraw(locks[index])}>Withdraw</button>
              </>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default LockerPage;
