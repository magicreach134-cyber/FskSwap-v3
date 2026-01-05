"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm, { FarmView } from "@/hooks/useFarm";

import "@/styles/staking.css";

const FarmClaim = () => {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");
  const { farms, loading, loadFarms, claim, stake, unstake } = useFarm(signer);
  const [loadingPid, setLoadingPid] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState<Record<number, string>>({});
  const [unstakeAmount, setUnstakeAmount] = useState<Record<number, string>>({});

  /* ---------- WALLET INIT ---------- */
  useEffect(() => {
    if (!window.ethereum) return;

    (async () => {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
        setAccount(await signer.getAddress());
      } catch (err) {
        console.error("Wallet initialization failed:", err);
      }
    })();
  }, []);

  /* ---------- LOAD FARMS ---------- */
  useEffect(() => {
    if (!signer || !account) return;
    loadFarms().catch(console.error);
  }, [signer, account, loadFarms]);

  /* ---------- CLAIM HANDLER ---------- */
  const handleClaim = async (pid: number) => {
    if (!signer || !account) return alert("Connect wallet first");

    setLoadingPid(pid);
    try {
      await claim(pid);
      alert("Claimed rewards successfully");
      await loadFarms();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Claim failed");
    } finally {
      setLoadingPid(null);
    }
  };

  /* ---------- STAKE HANDLER ---------- */
  const handleStake = async (pid: number) => {
    if (!signer || !account) return alert("Connect wallet first");
    const amount = stakeAmount[pid];
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");

    setLoadingPid(pid);
    try {
      await stake(pid, amount);
      alert("Staked successfully");
      setStakeAmount(prev => ({ ...prev, [pid]: "" }));
      await loadFarms();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Stake failed");
    } finally {
      setLoadingPid(null);
    }
  };

  /* ---------- UNSTAKE HANDLER ---------- */
  const handleUnstake = async (pid: number) => {
    if (!signer || !account) return alert("Connect wallet first");
    const amount = unstakeAmount[pid];
    if (!amount || parseFloat(amount) <= 0) return alert("Enter valid amount");

    setLoadingPid(pid);
    try {
      await unstake(pid, amount);
      alert("Unstaked successfully");
      setUnstakeAmount(prev => ({ ...prev, [pid]: "" }));
      await loadFarms();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Unstake failed");
    } finally {
      setLoadingPid(null);
    }
  };

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
              const provider = new BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
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

        {account &&
          farms.map((farm: FarmView) => {
            const pending = parseFloat(farm.pending);
            const staked = parseFloat(farm.staked);

            return (
              <div key={farm.pid} className="farm-card">
                <p>
                  <strong>Pair:</strong> {farm.name} ({farm.symbol})
                </p>
                <p>
                  <strong>Staked:</strong> {staked.toFixed(6)}
                </p>
                <p>
                  <strong>Claimable:</strong> {pending.toFixed(6)}
                </p>

                {/* Claim Button */}
                {pending > 0 && (
                  <button
                    onClick={() => handleClaim(farm.pid)}
                    disabled={loadingPid === farm.pid}
                  >
                    {loadingPid === farm.pid ? "Claiming..." : "Claim"}
                  </button>
                )}

                {/* Stake Section */}
                <div className="stake-section">
                  <input
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder="Amount to stake"
                    value={stakeAmount[farm.pid] || ""}
                    onChange={(e) =>
                      setStakeAmount((prev) => ({ ...prev, [farm.pid]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() => handleStake(farm.pid)}
                    disabled={loadingPid === farm.pid}
                  >
                    {loadingPid === farm.pid ? "Processing..." : "Stake"}
                  </button>
                </div>

                {/* Unstake Section */}
                <div className="unstake-section">
                  <input
                    type="number"
                    min="0"
                    step="0.000001"
                    placeholder="Amount to unstake"
                    value={unstakeAmount[farm.pid] || ""}
                    onChange={(e) =>
                      setUnstakeAmount((prev) => ({ ...prev, [farm.pid]: e.target.value }))
                    }
                  />
                  <button
                    onClick={() => handleUnstake(farm.pid)}
                    disabled={loadingPid === farm.pid}
                  >
                    {loadingPid === farm.pid ? "Processing..." : "Unstake"}
                  </button>
                </div>
              </div>
            );
          })}
      </main>
    </div>
  );
};

export default FarmClaim;
