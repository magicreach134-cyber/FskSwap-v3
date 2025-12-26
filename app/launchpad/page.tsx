"use client";

import { useEffect, useState } from "react";
import { ethers, BrowserProvider, JsonRpcSigner, Contract } from "ethers";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeSwitch from "@/components/ThemeSwitch";
import { launchpadFactoryAddress, ABIS } from "@/utils/constants";
import "../../styles/launchpad.css";

interface Presale {
  address: string;
  token: string;
  softCap: string;
  hardCap: string;
  totalRaised: string;
  startTime: number;
  endTime: number;
  userContribution: string;
  finalized: boolean;
  name: string;
  symbol: string;
}

const PRESALE_ABI = [
  "function token() view returns (address)",
  "function softCap() view returns (uint256)",
  "function hardCap() view returns (uint256)",
  "function totalRaised() view returns (uint256)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function contributions(address) view returns (uint256)",
  "function finalized() view returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function contribute() payable",
  "function claim()"
];

export default function LaunchpadPage() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [presales, setPresales] = useState<Presale[]>([]);
  const [contribution, setContribution] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [txPending, setTxPending] = useState<boolean>(false);

  /* ---------- WALLET INIT ---------- */
  useEffect(() => {
    if (!window.ethereum) return;

    const initWallet = async () => {
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();

        setProvider(browserProvider);
        setSigner(signer);
        setUserAddress(address);
      } catch (err) {
        console.error("Wallet initialization failed:", err);
      }
    };

    initWallet();
  }, []);

  /* ---------- LOAD PRESALES ---------- */
  useEffect(() => {
    if (!signer || !userAddress) return;

    const loadPresales = async () => {
      setLoading(true);
      try {
        const factory = new Contract(launchpadFactoryAddress, ABIS.FSKLaunchpadFactory, signer);
        const addresses: string[] = await factory.getPresales();

        const details = await Promise.all(
          addresses.map(async (addr) => {
            const c = new Contract(addr, PRESALE_ABI, signer);

            const [
              token,
              softCap,
              hardCap,
              totalRaised,
              startTime,
              endTime,
              userContribution,
              finalized,
              name,
              symbol
            ] = await Promise.all([
              c.token(),
              c.softCap(),
              c.hardCap(),
              c.totalRaised(),
              c.startTime(),
              c.endTime(),
              c.contributions(userAddress),
              c.finalized(),
              c.name(),
              c.symbol()
            ]);

            return {
              address: addr,
              token,
              softCap: ethers.formatUnits(softCap, 18),
              hardCap: ethers.formatUnits(hardCap, 18),
              totalRaised: ethers.formatUnits(totalRaised, 18),
              startTime: Number(startTime),
              endTime: Number(endTime),
              userContribution: ethers.formatUnits(userContribution, 18),
              finalized,
              name,
              symbol
            } as Presale;
          })
        );

        setPresales(details);
      } catch (err) {
        console.error("Failed to load presales:", err);
      }
      setLoading(false);
    };

    loadPresales();
  }, [signer, userAddress]);

  /* ---------- CONTRIBUTE ---------- */
  const handleContribute = async (p: Presale) => {
    if (!signer) return alert("Connect wallet first");
    if (!contribution || Number(contribution) <= 0) return alert("Enter a valid amount");

    try {
      setTxPending(true);
      const presaleContract = new Contract(p.address, PRESALE_ABI, signer);
      const tx = await presaleContract.contribute({ value: ethers.parseEther(contribution) });
      await tx.wait();
      alert("Contribution successful");
      setContribution("");
      // Refresh presales after contribution
      signer && userAddress && loadPresalesForRefresh();
    } catch (err: any) {
      alert("Contribution failed: " + (err?.message || "Unknown error"));
    }
    setTxPending(false);
  };

  /* ---------- CLAIM TOKENS ---------- */
  const handleClaim = async (p: Presale) => {
    if (!signer) return alert("Connect wallet first");

    try {
      setTxPending(true);
      const presaleContract = new Contract(p.address, PRESALE_ABI, signer);
      const tx = await presaleContract.claim();
      await tx.wait();
      alert("Tokens claimed successfully");
      signer && userAddress && loadPresalesForRefresh();
    } catch (err: any) {
      alert("Claim failed: " + (err?.message || "Unknown error"));
    }
    setTxPending(false);
  };

  /* ---------- REFRESH FUNCTION ---------- */
  const loadPresalesForRefresh = async () => {
    if (!signer || !userAddress) return;

    try {
      const factory = new Contract(launchpadFactoryAddress, ABIS.FSKLaunchpadFactory, signer);
      const addresses: string[] = await factory.getPresales();

      const details = await Promise.all(
        addresses.map(async (addr) => {
          const c = new Contract(addr, PRESALE_ABI, signer);

          const [
            token,
            softCap,
            hardCap,
            totalRaised,
            startTime,
            endTime,
            userContribution,
            finalized,
            name,
            symbol
          ] = await Promise.all([
            c.token(),
            c.softCap(),
            c.hardCap(),
            c.totalRaised(),
            c.startTime(),
            c.endTime(),
            c.contributions(userAddress),
            c.finalized(),
            c.name(),
            c.symbol()
          ]);

          return {
            address: addr,
            token,
            softCap: ethers.formatUnits(softCap, 18),
            hardCap: ethers.formatUnits(hardCap, 18),
            totalRaised: ethers.formatUnits(totalRaised, 18),
            startTime: Number(startTime),
            endTime: Number(endTime),
            userContribution: ethers.formatUnits(userContribution, 18),
            finalized,
            name,
            symbol
          } as Presale;
        })
      );

      setPresales(details);
    } catch (err) {
      console.error("Failed to refresh presales:", err);
    }
  };

  /* ---------- FORMAT UTILITY ---------- */
  const formatNumber = (val: string) => Number(val).toLocaleString(undefined, { maximumFractionDigits: 4 });

  /* ---------- RENDER ---------- */
  return (
    <div className="launchpad-page">
      <header className="launchpad-header">
        <div className="logo">
          <img src="/logo.png" alt="FSKSwap" />
          <span>FSKSwap Launchpad</span>
        </div>

        <nav>
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/farm">Farm</a>
          <a href="/flashswap">FlashSwap</a>
        </nav>

        <div className="header-right">
          <WalletConnectButton />
          <ThemeSwitch />
        </div>
      </header>

      <main className="launchpad-container">
        {loading && <p>Loading presales...</p>}
        {!loading && presales.length === 0 && <p>No presales found.</p>}

        {presales.map((p) => {
          const now = Math.floor(Date.now() / 1000);
          const active = now >= p.startTime && now <= p.endTime && !p.finalized;

          return (
            <div key={p.address} className="presale-card">
              <h3>{p.name} ({p.symbol})</h3>
              <p>Soft Cap: {formatNumber(p.softCap)}</p>
              <p>Hard Cap: {formatNumber(p.hardCap)}</p>
              <p>Total Raised: {formatNumber(p.totalRaised)}</p>
              <p>Your Contribution: {formatNumber(p.userContribution)}</p>

              {active && (
                <>
                  <input
                    type="number"
                    placeholder="Amount in BNB"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    disabled={txPending}
                  />
                  <button onClick={() => handleContribute(p)} disabled={txPending}>
                    {txPending ? "Processing..." : "Contribute"}
                  </button>
                </>
              )}

              {p.finalized && Number(p.userContribution) > 0 && (
                <button onClick={() => handleClaim(p)} disabled={txPending}>
                  {txPending ? "Processing..." : "Claim Tokens"}
                </button>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
