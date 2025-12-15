// pages/locker.tsx
"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import useLocker from "../hooks/useLocker";
import WalletConnectButton from "../components/WalletConnectButton";
import { TOKEN_COLORS } from "../utils/constants";

const LockerPage = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string>("");

  const { lockerContract, getOwnerLocks, getLock, getBeneficiaryVestings, getVesting, withdrawFromLock } =
    useLocker(signer);

  const [locks, setLocks] = useState<any[]>([]);
  const [vestings, setVestings] = useState<any[]>([]);

  // Initialize provider and signer
  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setAccount);
    }
  }, []);

  // Fetch locks and vestings
  useEffect(() => {
    if (!lockerContract || !account) return;

    const fetchData = async () => {
      const ownerLockIds = await getOwnerLocks(account);
      const ownerLocks = await Promise.all(ownerLockIds.map((id) => getLock(id)));
      setLocks(ownerLocks.filter(Boolean));

      const vestIds = await getBeneficiaryVestings(account);
      const beneficiaryVestings = await Promise.all(vestIds.map((id) => getVesting(id)));
      setVestings(beneficiaryVestings.filter(Boolean));
    };

    fetchData();
  }, [lockerContract, account]);

  const handleWithdraw = async (lockId: number, token: string, amount: string) => {
    try {
      await withdrawFromLock(lockId, account, amount);
      alert("Withdrawal successful!");
      // Refresh locks
      const updatedLock = await getLock(lockId);
      setLocks((prev) => prev.map((l) => (l.lockId === lockId ? updatedLock : l)));
    } catch (err: any) {
      alert("Withdrawal failed: " + err.message);
    }
  };

  return (
    <div className="locker-page">
      <header className="locker-header">
        <h1>FSKMegaLocker Dashboard</h1>
        <WalletConnectButton provider={provider} setSigner={setSigner} />
      </header>

      <main className="locker-container">
        <section className="locks-section">
          <h2>Your Locks</h2>
          {locks.length === 0 && <p>No locks found.</p>}
          {locks.map((lock, idx) => (
            <div key={idx} className="lock-card">
              <p>
                <strong>Token:</strong>{" "}
                <span style={{ color: TOKEN_COLORS[lock.token] || "#fff" }}>{lock.token}</span>
              </p>
              <p>
                <strong>Amount:</strong> {lock.amount}
              </p>
              <p>
                <strong>Unlock Time:</strong> {new Date(lock.unlockTime * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Withdrawn:</strong> {lock.withdrawn ? "Yes" : "No"}
              </p>
              {!lock.withdrawn && (
                <button onClick={() => handleWithdraw(lock.lockId, lock.token, lock.amount)}>
                  Withdraw
                </button>
              )}
            </div>
          ))}
        </section>

        <section className="vestings-section">
          <h2>Your Vestings</h2>
          {vestings.length === 0 && <p>No vestings found.</p>}
          {vestings.map((v, idx) => (
            <div key={idx} className="vesting-card">
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
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default LockerPage;
