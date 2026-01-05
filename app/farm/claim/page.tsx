"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm, { FarmView } from "@/hooks/useFarm";
import "@/styles/staking.css";

const FarmClaim = () => {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const { farms, claim, stake, unstake, loadFarms } = useFarm(signer);
  const [loadingPid, setLoadingPid] = useState<number | null>(null);
  const [loadingFarms, setLoadingFarms] = useState(false);

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

  /* ---------- THEME TOGGLE ---------- */
  useEffect(() => {
    const root = document.body;
    root.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* ---------- LOAD FARMS ---------- */
  useEffect(() => {
    if (!signer || !account) return;
    setLoadingFarms(true);
    loadFarms()
      .catch(console.error)
      .finally(() => setLoadingFarms(false));
  }, [signer, account, loadFarms]);

  /* ---------- CLAIM ---------- */
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

  /* ---------- STAKE / UNSTAKE ---------- */
  const handleStake = async (pid: number) => {
    const amount = prompt("Enter amount to stake:");
    if (!amount || Number(amount) <= 0) return;
    if (!signer || !account) return alert("Connect wallet first");
    setLoadingPid(pid);
    try {
      await stake(pid, amount);
      alert("Staked successfully");
      await loadFarms();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Stake failed");
    } finally {
      setLoadingPid(null);
    }
  };

  const handleUnstake = async (pid: number) => {
    const amount = prompt("Enter amount to unstake:");
    if (!amount || Number(amount) <= 0) return;
    if (!signer || !account) return alert("Connect wallet first");
    setLoadingPid(pid);
    try {
      await unstake(pid, amount);
      alert("Unstaked successfully");
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
      {/* ---------- HEADER ---------- */}
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
          <ThemeSwitch darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </header>

      {/* ---------- MAIN ---------- */}
      <main className="farm-container">
        <h2>Your Farms</h2>

        {!account && <p>Please connect your wallet to view farms.</p>}
        {account && loadingFarms && <p>Loading farms...</p>}
        {account && !loadingFarms && farms.length === 0 && <p>No farms available.</p>}

        {account && farms.map((farm: FarmView) => {
          const claimable = Number(farm.pending ?? "0");
          const staked = Number(farm.staked ?? "0");

          return (
            <div key={farm.pid} className="farm-card">
              <h3>{farm.name} ({farm.symbol})</h3>
              <p><strong>Claimable:</strong> {claimable.toFixed(6)}</p>
              <p><strong>Staked:</strong> {staked.toFixed(6)}</p>

              <div className="farm-actions">
                <button
                  onClick={() => handleStake(farm.pid)}
                  disabled={loadingPid === farm.pid}
                >
                  Stake
                </button>
                <button
                  onClick={() => handleUnstake(farm.pid)}
                  disabled={loadingPid === farm.pid}
                >
                  Unstake
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
      </main>
    </div>
  );
};

export default FarmClaim;
