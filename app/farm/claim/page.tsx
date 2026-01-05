"use client";

import { useEffect, useState } from "react";
import { JsonRpcSigner } from "ethers";
import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm, { FarmView } from "@/hooks/useFarm";
import "@/styles/staking.css";

const FarmClaim = () => {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");
  const { farms, stake, unstake, claim, claimAll, loadFarms, loading } = useFarm();
  const [loadingPid, setLoadingPid] = useState<number | null>(null);
  const [inputAmounts, setInputAmounts] = useState<{ [pid: number]: string }>({});

  /* ---------- WALLET INIT ---------- */
  useEffect(() => {
    if (!window.ethereum) return;
    (async () => {
      try {
        const provider = new window.ethereum.providers?.Web3Provider(window.ethereum) || null;
        if (!provider) return;
        const signer = provider.getSigner();
        setSigner(signer);
        setAccount(await signer.getAddress());
      } catch (err) {
        console.error("Wallet init failed:", err);
      }
    })();
  }, []);

  /* ---------- LOAD FARMS ---------- */
  useEffect(() => {
    if (!account) return;
    loadFarms().catch(console.error);
  }, [account, loadFarms]);

  /* ---------- STAKE / UNSTAKE ---------- */
  const handleStake = async (pid: number) => {
    const amount = inputAmounts[pid];
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");
    setLoadingPid(pid);
    try {
      await stake(pid, amount);
      setInputAmounts((prev) => ({ ...prev, [pid]: "" }));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Stake failed");
    } finally {
      setLoadingPid(null);
    }
  };

  const handleUnstake = async (pid: number) => {
    const amount = inputAmounts[pid];
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");
    setLoadingPid(pid);
    try {
      await unstake(pid, amount);
      setInputAmounts((prev) => ({ ...prev, [pid]: "" }));
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Unstake failed");
    } finally {
      setLoadingPid(null);
    }
  };

  const handleClaim = async (pid: number) => {
    setLoadingPid(pid);
    try {
      await claim(pid);
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Claim failed");
    } finally {
      setLoadingPid(null);
    }
  };

  const handleClaimAll = async () => {
    try {
      await claimAll();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Claim All failed");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="farm-page">
      <header className="farm-header">
        <div className="logo">
          <img src="/assets/logo.png" alt="FSKSwap" />
          <span>Farm Dashboard</span>
        </div>
        <div className="header-right">
          <button
            onClick={async () => {
              if (!window.ethereum) return alert("No wallet found");
              const provider = new window.ethereum.providers?.Web3Provider(window.ethereum);
              if (!provider) return;
              const signer = provider.getSigner();
              setSigner(signer);
              setAccount(await signer.getAddress());
            }}
          >
            {account ? account.slice(0, 6) + "..." + account.slice(-4) : "Connect Wallet"}
          </button>
          <ThemeSwitch />
        </div>
      </header>

      <main className="farm-container">
        <h2>Your Farms</h2>
        {!account && <p>Please connect your wallet to view farms.</p>}
        {account && loading && <p>Loading farms...</p>}
        {account && !loading && farms.length === 0 && <p>No farms available.</p>}

        {account && !loading && farms.length > 0 && (
          <>
            <button onClick={handleClaimAll} className="claim-all-btn">
              Claim All Rewards
            </button>

            {farms.map((farm: FarmView) => {
              const claimable = Number(farm.pending);
              const balance = Number(farm.balance);
              const staked = Number(farm.staked);

              return (
                <div key={farm.pid} className="farm-card">
                  <h3>{farm.name} ({farm.symbol})</h3>
                  <p><strong>Staked:</strong> {staked.toFixed(6)}</p>
                  <p><strong>Balance:</strong> {balance.toFixed(6)}</p>
                  <p><strong>Claimable:</strong> {claimable.toFixed(6)}</p>

                  <input
                    type="number"
                    placeholder="Amount"
                    value={inputAmounts[farm.pid] || ""}
                    onChange={(e) =>
                      setInputAmounts((prev) => ({ ...prev, [farm.pid]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() =>
                      setInputAmounts((prev) => ({ ...prev, [farm.pid]: balance.toString() }))
                    }
                  >
                    Max
                  </button>

                  <div className="farm-actions">
                    <button
                      onClick={() => handleStake(farm.pid)}
                      disabled={loadingPid === farm.pid}
                    >
                      {loadingPid === farm.pid ? "Processing..." : "Stake"}
                    </button>
                    <button
                      onClick={() => handleUnstake(farm.pid)}
                      disabled={loadingPid === farm.pid}
                    >
                      {loadingPid === farm.pid ? "Processing..." : "Unstake"}
                    </button>
                    {claimable > 0 && (
                      <button
                        onClick={() => handleClaim(farm.pid)}
                        disabled={loadingPid === farm.pid}
                      >
                        {loadingPid === farm.pid ? "Claiming..." : "Claim"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
};

export default FarmClaim;
