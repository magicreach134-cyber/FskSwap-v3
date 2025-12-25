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

      const lockIds = await getOwnerLocks(account);
      const lockData = await Promise.all(
        lockIds.map(async (id) => ({ id, ...(await getLock(id)) }))
      );
      setLocks(lockData.filter((l) => l.token));

      const vestIds = await getBeneficiaryVestings(account);
      const vestData = await Promise.all(
        vestIds.map(async (id) => ({ id, ...(await getVesting(id)) }))
      );
      setVestings(vestData.filter((v) => v.token));

      setLoading(false);
    };

    load();
  }, [lockerContract, account]);

  /* ---------------- Actions ---------------- */
  const handleWithdrawLock = async (lockId: number, amount: string) => {
    setLoading(true);
    await withdrawFromLock(lockId, account!, amount);
    setLoading(false);
  };

  const handleClaimVesting = async (vestId: number) => {
    setLoading(true);
    await claimVesting(vestId);
    setLoading(false);
  };

  return (
    <div className="locker-page">
      <header className="locker-header">
        <h1>FSKMegaLocker Dashboard</h1>
        <div className="header-right">
          <WalletConnectButton />
          <ThemeSwitch />
        </div>
      </header>

      {loading && <p>Loading...</p>}

      <div className="locker-container">
        <section>
          <h2>Your Locks</h2>
          {locks.length === 0 && <p>No locks found.</p>}
          {locks.map((l) => (
            <div key={l.id} className="lock-card">
              <p><strong>Token:</strong> {l.token}</p>
              <p><strong>Amount:</strong> {l.amount}</p>
              <p><strong>Unlock:</strong> {new Date(l.unlockTime * 1000).toLocaleString()}</p>
              {!l.withdrawn && (
                <button onClick={() => handleWithdrawLock(l.id, l.amount)}>
                  Withdraw
                </button>
              )}
            </div>
          ))}
        </section>

        <section>
          <h2>Your Vestings</h2>
          {vestings.length === 0 && <p>No vestings found.</p>}
          {vestings.map((v) => (
            <div key={v.id} className="vesting-card">
              <p><strong>Token:</strong> {v.token}</p>
              <p><strong>Total:</strong> {v.amount}</p>
              <p><strong>Claimed:</strong> {v.claimed}</p>
              <button onClick={() => handleClaimVesting(v.id)}>Claim</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default LockerPage;
