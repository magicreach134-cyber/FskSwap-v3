"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import useLocker from "../../hooks/useLocker";
import useWallet from "../../hooks/useWallet";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import "../../styles/locker.css";

const LockerPage = () => {
  const { signer, account } = useWallet();
  const {
    lockerContract,
    getOwnerLocks,
    getLock,
    getBeneficiaryVestings,
    getVesting,
    withdrawFromLock,
    claimVesting,
  } = useLocker(signer);

  const [locks, setLocks] = useState<any[]>([]);
  const [vestings, setVestings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Load Locks & Vestings ---------------- */
  useEffect(() => {
    if (!lockerContract || !account) return;

    const load = async () => {
      setLoading(true);

      try {
        const lockIds = await getOwnerLocks(account);
        const lockData = await Promise.all(
          lockIds.map(async (id) => {
            const lock = await getLock(id);
            return lock ? { id, ...lock } : null;
          })
        );
        setLocks(lockData.filter(Boolean));

        const vestIds = await getBeneficiaryVestings(account);
        const vestData = await Promise.all(
          vestIds.map(async (id) => {
            const vest = await getVesting(id);
            return vest ? { id, ...vest } : null;
          })
        );
        setVestings(vestData.filter(Boolean));
      } catch (err) {
        console.error("Failed to load locks/vestings:", err);
      }

      setLoading(false);
    };

    load();
  }, [lockerContract, account]);

  /* ---------------- Actions ---------------- */
  const handleWithdrawLock = async (lockId: number, amount: string) => {
    if (!account) return;
    setLoading(true);
    try {
      await withdrawFromLock(lockId, account, amount);
      const updated = await getLock(lockId);
      setLocks((prev) => prev.map((l) => (l.id === lockId ? { ...l, ...updated } : l)));
    } catch (err: any) {
      alert("Withdraw failed: " + (err?.message || err));
    }
    setLoading(false);
  };

  const handleClaimVesting = async (vestId: number) => {
    setLoading(true);
    try {
      await claimVesting(vestId);
      const updated = await getVesting(vestId);
      setVestings((prev) => prev.map((v) => (v.id === vestId ? { ...v, ...updated } : v)));
    } catch (err: any) {
      alert("Claim failed: " + (err?.message || err));
    }
    setLoading(false);
  };

  return (
    <div className="locker-page">
      <header className="locker-header">
        <h1>FSKMegaLocker Dashboard</h1>
        <div className="header-right" style={{ display: "flex", gap: "12px" }}>
          <WalletConnectButton />
          <ThemeSwitch />
        </div>
      </header>

      {loading && <p className="locker-loading">Loading data...</p>}

      <div className="locker-container">
        {/* ---------------- LOCKS ---------------- */}
        <section>
          <h2>Your Locks</h2>
          {locks.length === 0 && <p>No locks found.</p>}
          {locks.map((l) => (
            <div key={l.id} className="lock-card">
              <p>
                <strong>Token:</strong> {l.token}
              </p>
              <p>
                <strong>Amount:</strong> {l.amount}
              </p>
              <p>
                <strong>Unlock:</strong> {new Date(l.unlockTime * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Withdrawn:</strong> {l.withdrawn ? "Yes" : "No"}
              </p>
              {!l.withdrawn && (
                <button onClick={() => handleWithdrawLock(l.id, l.amount)}>Withdraw</button>
              )}
            </div>
          ))}
        </section>

        {/* ---------------- VESTINGS ---------------- */}
        <section>
          <h2>Your Vestings</h2>
          {vestings.length === 0 && <p>No vestings found.</p>}
          {vestings.map((v) => (
            <div key={v.id} className="vesting-card">
              <p>
                <strong>Token:</strong> {v.token}
              </p>
              <p>
                <strong>Total:</strong> {v.amount}
              </p>
              <p>
                <strong>Claimed:</strong> {v.claimed}
              </p>
              <p>
                <strong>Start:</strong> {new Date(v.start * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Duration:</strong> {v.duration} seconds
              </p>
              <span
                className={`vesting-status ${v.claimed === v.amount ? "claimed" : "pending"}`}
              >
                {v.claimed === v.amount ? "Claimed" : "Pending"}
              </span>
              <button onClick={() => handleClaimVesting(v.id)}>Claim</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default LockerPage;
