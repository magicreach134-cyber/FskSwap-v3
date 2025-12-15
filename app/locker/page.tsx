"use client";

import { useEffect, useState } from "react";
import useLocker from "../hooks/useLocker";
import { ethers } from "ethers";
import WalletConnectButton from "../components/WalletConnectButton";
import ThemeSwitch from "../components/ThemeSwitch";
import "../styles/locker.css";

const LockerPage = ({ signer }: { signer: ethers.Signer | null }) => {
  const { lockerContract, getOwnerLocks, getLock, getBeneficiaryVestings, getVesting, withdrawFromLock, claimVesting } = useLocker(signer);
  const [account, setAccount] = useState<string>("");
  const [locks, setLocks] = useState<any[]>([]);
  const [vestings, setVestings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch account
  useEffect(() => {
    if (signer) {
      signer.getAddress().then(setAccount);
    }
  }, [signer]);

  // Fetch locks and vestings
  useEffect(() => {
    const fetchData = async () => {
      if (!lockerContract || !account) return;
      setLoading(true);

      // Fetch locks
      const lockIds = await getOwnerLocks(account);
      const lockDetails = await Promise.all(lockIds.map((id) => getLock(id)));
      setLocks(lockDetails.filter(Boolean));

      // Fetch vestings
      const vestIds = await getBeneficiaryVestings(account);
      const vestDetails = await Promise.all(vestIds.map((id) => getVesting(id)));
      setVestings(vestDetails.filter(Boolean));

      setLoading(false);
    };
    fetchData();
  }, [lockerContract, account]);

  // Withdraw lock
  const handleWithdrawLock = async (lockId: number, tokenAmount: string) => {
    try {
      setLoading(true);
      await withdrawFromLock(lockId, account, tokenAmount);
      alert("Lock withdrawn successfully!");
      const updatedLock = await getLock(lockId);
      setLocks((prev) => prev.map((l) => (l.lockId === lockId ? updatedLock : l)));
    } catch (err: any) {
      alert("Withdraw failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Claim vesting
  const handleClaimVesting = async (vestId: number) => {
    try {
      setLoading(true);
      await claimVesting(vestId);
      alert("Vesting claimed successfully!");
      const updatedVest = await getVesting(vestId);
      setVestings((prev) => prev.map((v) => (v.vestId === vestId ? updatedVest : v)));
    } catch (err: any) {
      alert("Claim failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="locker-page">
      <header className="locker-header">
        <h1>FSKMegaLocker Dashboard</h1>
        <div className="header-right">
          <WalletConnectButton signer={signer} />
          <ThemeSwitch />
        </div>
      </header>

      {loading && <p>Loading data...</p>}

      <div className="locker-container">
        <div className="locks-section">
          <h2>Your Locks</h2>
          {locks.length === 0 && <p>No locks found.</p>}
          {locks.map((lock, idx) => (
            <div key={idx} className="lock-card">
              <p><strong>Token:</strong> {lock.token}</p>
              <p><strong>Amount:</strong> {lock.amount}</p>
              <p><strong>Unlock Time:</strong> {new Date(lock.unlockTime * 1000).toLocaleString()}</p>
              <p><strong>Withdrawn:</strong> {lock.withdrawn ? "Yes" : "No"}</p>
              {!lock.withdrawn && (
                <button onClick={() => handleWithdrawLock(lock.lockId, lock.amount)}>Withdraw</button>
              )}
            </div>
          ))}
        </div>

        <div className="vestings-section">
          <h2>Your Vestings</h2>
          {vestings.length === 0 && <p>No vestings found.</p>}
          {vestings.map((v, idx) => (
            <div key={idx} className="vesting-card">
              <p><strong>Token:</strong> {v.token}</p>
              <p><strong>Amount:</strong> {v.amount}</p>
              <p><strong>Start:</strong> {new Date(v.start * 1000).toLocaleString()}</p>
              <p><strong>Duration:</strong> {v.duration} seconds</p>
              <p><strong>Claimed:</strong> {v.claimed}</p>
              <button onClick={() => handleClaimVesting(v.vestId)}>Claim Vesting</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LockerPage;
