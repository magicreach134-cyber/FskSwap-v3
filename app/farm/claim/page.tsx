"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

import ThemeSwitch from "@/components/ThemeSwitch";
import useFarm, { FarmView } from "@/hooks/useFarm";

import "@/styles/staking.css";

const FarmClaim = () => {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>("");
  const { farms, claim, loadFarms } = useFarm(signer);
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
    if (!signer || !account) {
      alert("Connect wallet first");
      return;
    }

    setLoadingPid(pid);
    try {
      await claim(pid);
      alert("Claimed rewards successfully");
      await loadFarms(); // refresh farm data
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Claim failed");
    } finally {
      setLoadingPid(null);
    }
  };

  return (
    <div className="farm-page">
      <header className="farm-header">
        <div className="logo">
          <img src="/assets/logo.png" alt="FSKSwap" />
          <span>Claim Farm Rewards</span>
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
        <h2>Your Claimable Rewards</h2>

        {!account && <p>Please connect your wallet to view farms.</p>}
        {account && loadingFarms && <p>Loading farms...</p>}
        {account && !loadingFarms && farms.length === 0 && <p>No farms available.</p>}

        {account && farms.map((farm: FarmView) => {
          const claimable = Number(farm.pending ?? "0");

          return (
            <div key={farm.pid} className="farm-card">
              <p>
                <strong>Pair:</strong> {farm.name} ({farm.symbol})
              </p>
              <p>
                <strong>Claimable:</strong> {claimable.toFixed(6)}
              </p>

              {claimable > 0 && (
                <button
                  onClick={() => handleClaim(farm.pid)}
                  disabled={loadingPid === farm.pid}
                >
                  {loadingPid === farm.pid ? "Claiming..." : "Claim"}
                </button>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default FarmClaim;
