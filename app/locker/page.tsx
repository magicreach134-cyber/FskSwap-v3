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

const LockerPage = () => {
  /* ---------- WALLET STATE ---------- */
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");

  /* ---------- INIT WALLET ---------- */
  useEffect(() => {
    if (!window.ethereum) return;

    (async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
        setAccount(await signer.getAddress());
      } catch (err) {
        console.error("Wallet init failed:", err);
      }
    })();
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
  } = useLocker(signer);

  const [locks, setLocks] = useState<(Lock & { id: number })[]>([]);
  const [vestings, setVestings] = useState<(Vesting & { id: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState<LoadingMap>({
    locks: {},
    vestings: {},
  });

  /* ---------- LOAD LOCKS & VESTINGS ---------- */
  useEffect(() => {
    if (!lockerContract || !account) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const lockIds = await getOwnerLocks(account);
        const lockData = await Promise.all(
          lockIds.map(async (id) => {
            const lock = await getLock(id);
            return lock ? { id, ...lock } : null;
          })
        );
        setLocks(lockData.filter(Boolean) as (Lock & { id: number })[]);

        const vestIds = await getBeneficiaryVestings(account);
        const vestData = await Promise.all(
          vestIds.map(async (id) => {
            const vest = await getVesting(id);
            return vest ? { id, ...vest } : null;
          })
        );
        setVestings(vestData.filter(Boolean) as (Vesting & { id: number })[]);
      } catch (err) {
        console.error("Failed to load locker data:", err);
      }
      setLoading(false);
    };

    loadData();
  }, [lockerContract, account]);

  /* ---------- ACTIONS ---------- */
  const handleWithdrawLock = async (lockId: number, amount: string) => {
    if (!account) return;

    setLoadingMap((p) => ({
      ...p,
      locks: { ...p.locks, [lockId]: true },
    }));

    try {
      await withdrawFromLock(lockId, account, amount);
      const updated = await getLock(lockId);
      if (updated) {
        setLocks((prev) =>
          prev.map((l) => (l.id === lockId ? { id: lockId, ...updated } : l))
        );
      }
    } catch (err: any) {
      alert("Withdraw failed: " + (err?.message || err));
    }

    setLoadingMap((p) => ({
      ...p,
      locks: { ...p.locks, [lockId]: false },
    }));
  };

  const handleClaimVesting = async (vestId: number) => {
    setLoadingMap((p) => ({
      ...p,
      vestings: { ...p.vestings, [vestId]: true },
    }));

    try {
      await claimVesting(vestId);
      const updated = await getVesting(vestId);
      if (updated) {
        setVestings((prev) =>
          prev.map((v) => (v.id === vestId ? { id: vestId, ...updated } : v))
        );
      }
    } catch (err: any) {
      alert("Claim failed: " + (err?.message || err));
    }

    setLoadingMap((p) => ({
      ...p,
      vestings: { ...p.vestings, [vestId]: false },
    }));
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="locker-page">
      <header className="locker-header">
        <h1>FSKMegaLocker Dashboard</h1>
        <ThemeSwitch />
      </header>

      {loading && <p className="locker-loading">Loading data...</p>}

      <div className="locker-container">
        {/* -------- LOCKS -------- */}
        <section>
          <h2>Your Locks</h2>
          {locks.length === 0 && <p>No locks found.</p>}
          {locks.map((l) => (
            <div key={l.id} className="lock-card">
              <p><strong>Token:</strong> {l.token}</p>
              <p><strong>Amount:</strong> {l.amount}</p>
              <p>
                <strong>Unlock:</strong>{" "}
                {new Date(l.unlockTime * 1000).toLocaleString()}
              </p>
              <p><strong>Withdrawn:</strong> {l.withdrawn ? "Yes" : "No"}</p>
              {!l.withdrawn && (
                <button
                  disabled={loadingMap.locks[l.id]}
                  onClick={() => handleWithdrawLock(l.id, l.amount)}
                >
                  {loadingMap.locks[l.id] ? "Withdrawing..." : "Withdraw"}
                </button>
              )}
            </div>
          ))}
        </section>

        {/* -------- VESTINGS -------- */}
        <section>
          <h2>Your Vestings</h2>
          {vestings.length === 0 && <p>No vestings found.</p>}
          {vestings.map((v) => (
            <div key={v.id} className="vesting-card">
              <p><strong>Token:</strong> {v.token}</p>
              <p><strong>Total:</strong> {v.amount}</p>
              <p><strong>Claimed:</strong> {v.claimed}</p>
              <p>
                <strong>Start:</strong>{" "}
                {new Date(v.start * 1000).toLocaleString()}
              </p>
              <p><strong>Duration:</strong> {v.duration} seconds</p>
              <span
                className={`vesting-status ${
                  v.claimed === v.amount ? "claimed" : "pending"
                }`}
              >
                {v.claimed === v.amount ? "Claimed" : "Pending"}
              </span>
              {v.claimed !== v.amount && (
                <button
                  disabled={loadingMap.vestings[v.id]}
                  onClick={() => handleClaimVesting(v.id)}
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
