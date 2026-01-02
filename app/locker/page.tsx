"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import useLocker, { Lock, Vesting } from "@/hooks/useLocker";
import ThemeSwitch from "@/components/ThemeSwitch";
import "@/styles/locker.css";

type LoadingMap = {
  locks: Record<number, boolean>;
  vestings: Record<number, boolean>;
};

const AUTO_REFRESH_INTERVAL = 5000; // 5 seconds

const LockerPage = () => {
  /* ---------- WALLET STATE ---------- */
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  /* ---------- INIT WALLET ---------- */
  useEffect(() => {
    if (!window.ethereum) return;

    const initWallet = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setSigner(signer);
        setAccount(address);
      } catch (err) {
        console.error("Wallet init failed:", err);
        setAccount(null);
      }
    };

    initWallet();
  }, []);

  /* ---------- LOCKER HOOK ---------- */
  const {
    lockerContract,
    getOwnerLocks,
    getLock,
    getBeneficiaryVestings,
    getVesting,
    withdrawFromLock,
    claimVesting,
  } = useLocker({ provider: signer, signer });

  const [locks, setLocks] = useState<Lock[]>([]);
  const [vestings, setVestings] = useState<Vesting[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMap, setLoadingMap] = useState<LoadingMap>({ locks: {}, vestings: {} });

  /* ---------- LOAD LOCKS & VESTINGS ---------- */
  const loadLockerData = async () => {
    if (!lockerContract || !account) return;

    setLoading(true);
    try {
      // Load locks
      const lockIds = await getOwnerLocks(account);
      const lockData = await Promise.all(
        lockIds.map(async (id) => {
          const lock = await getLock(id);
          return lock ? lock : null;
        })
      );
      setLocks(lockData.filter(Boolean) as Lock[]);

      // Load vestings
      const vestIds = await getBeneficiaryVestings(account);
      const vestData = await Promise.all(
        vestIds.map(async (id) => {
          const vest = await getVesting(id);
          return vest ? vest : null;
        })
      );
      setVestings(vestData.filter(Boolean) as Vesting[]);
    } catch (err) {
      console.error("Failed to load locker data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLockerData();
  }, [lockerContract, account]);

  /* ---------- AUTO REFRESH ---------- */
  useEffect(() => {
    if (!lockerContract || !account) return;

    const interval = setInterval(() => {
      loadLockerData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [lockerContract, account]);

  /* ---------- ACTIONS ---------- */
  const handleWithdrawLock = async (lock: Lock) => {
    if (!account || !signer) return;

    setLoadingMap((p) => ({ ...p, locks: { ...p.locks, [lock.id]: true } }));

    try {
      await withdrawFromLock(lock.id, account, lock.amount);
      const updated = await getLock(lock.id);
      if (updated) {
        setLocks((prev) => prev.map((l) => (l.id === lock.id ? updated : l)));
      }
    } catch (err: any) {
      alert("Withdraw failed: " + (err?.message || err));
    } finally {
      setLoadingMap((p) => ({ ...p, locks: { ...p.locks, [lock.id]: false } }));
    }
  };

  const handleClaimVesting = async (vest: Vesting) => {
    if (!signer) return;

    setLoadingMap((p) => ({ ...p, vestings: { ...p.vestings, [vest.id]: true } }));

    try {
      await claimVesting(vest.id);
      const updated = await getVesting(vest.id);
      if (updated) {
        setVestings((prev) => prev.map((v) => (v.id === vest.id ? updated : v)));
      }
    } catch (err: any) {
      alert("Claim failed: " + (err?.message || err));
    } finally {
      setLoadingMap((p) => ({ ...p, vestings: { ...p.vestings, [vest.id]: false } }));
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="locker-page">
      <header className="locker-header">
        <h1>FSKMegaLocker Dashboard</h1>
        <ThemeSwitch />
      </header>

      {!account && <p>Please connect your wallet to view locks and vestings.</p>}
      {loading && <p className="locker-loading">Loading data...</p>}

      <div className="locker-container">
        {/* ---------- LOCKS ---------- */}
        <section>
          <h2>Your Locks</h2>
          {locks.length === 0 && <p>No locks found.</p>}
          {locks.map((l) => (
            <div key={l.id} className="lock-card">
              <p><strong>Token:</strong> {l.token}</p>
              <p><strong>Amount:</strong> {l.amount}</p>
              <p><strong>Unlock:</strong> {new Date(l.unlockTime * 1000).toLocaleString()}</p>
              <p><strong>Withdrawn:</strong> {l.withdrawn ? "Yes" : "No"}</p>
              {!l.withdrawn && (
                <button
                  disabled={loadingMap.locks[l.id]}
                  onClick={() => handleWithdrawLock(l)}
                >
                  {loadingMap.locks[l.id] ? "Withdrawing..." : "Withdraw"}
                </button>
              )}
            </div>
          ))}
        </section>

        {/* ---------- VESTINGS ---------- */}
        <section>
          <h2>Your Vestings</h2>
          {vestings.length === 0 && <p>No vestings found.</p>}
          {vestings.map((v) => (
            <div key={v.id} className="vesting-card">
              <p><strong>Token:</strong> {v.token}</p>
              <p><strong>Total:</strong> {v.amount}</p>
              <p><strong>Claimed:</strong> {v.claimed}</p>
              <p><strong>Start:</strong> {new Date(v.start * 1000).toLocaleString()}</p>
              <p><strong>Duration:</strong> {v.duration} seconds</p>
              <span className={`vesting-status ${v.claimed === v.amount ? "claimed" : "pending"}`}>
                {v.claimed === v.amount ? "Claimed" : "Pending"}
              </span>
              {v.claimed !== v.amount && (
                <button
                  disabled={loadingMap.vestings[v.id]}
                  onClick={() => handleClaimVesting(v)}
                >
                  {loadingMap.vestings[v.id] ? "Claiming..." : "Claim"}
                </button>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default LockerPage;
