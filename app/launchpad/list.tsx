"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import usePresaleSearch from "../../hooks/usePresaleSearch";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI, TOKEN_COLORS } from "../../utils/constants";
import "../../styles/launchpad.css";

/**
 * LaunchpadList - shows all presales from factory,
 * searchable and filterable by status.
 */
const ITEMS_PER_PAGE = 8;

const LaunchpadList = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [presales, setPresales] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // init provider / signer
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const p = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(p);
      const s = p.getSigner();
      setSigner(s);
      s.getAddress().then(setUserAddress).catch(() => {});
    }
  }, []);

  // fetch presales
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      if (!provider && !signer) return;
      setLoading(true);
      try {
        const activeSigner = signer || provider.getSigner?.();
        const factory = new ethers.Contract(launchpadFactoryAddress, FSKLaunchpadFactoryABI, activeSigner);
        const addresses = await factory.getPresales();
        const now = Math.floor(Date.now() / 1000);

        const details = await Promise.all(addresses.map(async (addr) => {
          try {
            const c = new ethers.Contract(addr, [
              "function token() view returns (address)",
              "function softCap() view returns (uint256)",
              "function hardCap() view returns (uint256)",
              "function totalRaised() view returns (uint256)",
              "function startTime() view returns (uint256)",
              "function endTime() view returns (uint256)",
              "function contributions(address) view returns (uint256)",
              "function finalized() view returns (bool)",
              "function name() view returns (string)",
              "function symbol() view returns (string)"
            ], activeSigner);

            const [token, softCap, hardCap, totalRaised, startTime, endTime, userContribution, finalized, name, symbol] =
              await Promise.all([
                c.token(), c.softCap(), c.hardCap(), c.totalRaised(),
                c.startTime(), c.endTime(), c.contributions(userAddress || ethers.constants.AddressZero),
                c.finalized(), c.name().catch(()=>""), c.symbol().catch(()=>"")
              ]);

            const status = now < startTime ? "upcoming" : now >= startTime && now <= endTime ? "active" : "ended";

            return { address: addr, token, softCap, hardCap, totalRaised, startTime, endTime, userContribution, finalized, name, symbol, status, contract: c };
          } catch (e) {
            // skip broken presale
            console.warn("presale load failed", addr, e);
            return null;
          }
        }));

        if (!mounted) return;
        setPresales(details.filter(Boolean));
      } catch (err) {
        console.error("fetch presales error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    // auto refresh
    let iv;
    if (autoRefresh) iv = setInterval(fetchAll, 15_000);
    return () => {
      mounted = false;
      if (iv) clearInterval(iv);
    };
  }, [provider, signer, userAddress, autoRefresh]);

  const { query, setQuery, filteredPresales } = usePresaleSearch(presales);

  // pagination
  const start = (page - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredPresales.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredPresales.length / ITEMS_PER_PAGE) || 1;

  const formatTime = (ts) => {
    const diff = ts * 1000 - Date.now();
    if (diff <= 0) return "0d 0h 0m";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="launchpad-page">
      <header className="launchpad-header">
        <div className="logo">
          <img src="/assets/logo.svg" alt="FSKSwap" />
          <span>FSKSwap</span>
        </div>
        <nav>
          <a href="/swap">Swap</a>
          <a href="/launchpad">Launchpad</a>
          <a href="/staking">Staking</a>
          <a href="/flashswap">FlashSwap</a>
        </nav>
        <div className="header-right">
          <WalletConnectButton provider={provider} setSigner={setSigner} />
          <ThemeSwitch />
        </div>
      </header>

      <main className="launchpad-container">
        <h2>All Presales</h2>

        <div className="presale-controls">
          <input
            type="text"
            placeholder="Search by token, symbol, address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ fontSize: 13 }}>
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /> Auto-refresh
            </label>
            <div className="tabs">
              <button onClick={() => setQuery("")}>All</button>
            </div>
          </div>
        </div>

        {loading && <p>Loading presales…</p>}
        {!loading && pageItems.length === 0 && <p>No presales found.</p>}

        {pageItems.map((p, idx) => (
          <div key={p.address || idx} className="presale-card">
            <p>
              <strong>Token:</strong>{" "}
              <span style={{ color: TOKEN_COLORS[p.symbol] || "#fbbf24" }}>{p.name || p.symbol} ({p.symbol || "—"})</span>
            </p>
            <p><strong>Token Address:</strong> {p.token}</p>
            <p><strong>Soft Cap:</strong> {ethers.utils.formatEther(p.softCap || 0)}</p>
            <p><strong>Hard Cap:</strong> {ethers.utils.formatEther(p.hardCap || 0)}</p>
            <p><strong>Total Raised:</strong> {ethers.utils.formatEther(p.totalRaised || 0)}</p>
            <p><strong>Status:</strong> {p.status}</p>
            <p><strong>Time Left:</strong> {formatTime(p.endTime)}</p>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <a href={`/launchpad/project/${p.address}`}><button>Details</button></a>
              {p.finalized && p.userContribution > 0 && <a href={`/launchpad/project/${p.address}`}><button>Claim/View</button></a>}
            </div>
          </div>
        ))}

        {/* pagination controls */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
          <button onClick={() => setPage((s) => Math.max(1, s-1))} disabled={page <= 1}>Prev</button>
          <div>Page {page} / {totalPages}</div>
          <button onClick={() => setPage((s) => Math.min(totalPages, s+1))} disabled={page >= totalPages}>Next</button>
        </div>
      </main>
    </div>
  );
};

export default LaunchpadList;
