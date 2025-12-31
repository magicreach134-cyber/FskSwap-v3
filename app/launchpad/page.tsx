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
  const [contributions, setContributions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);

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

  /* ---------- FETCH PRESALES ---------- */
  const fetchPresales = async (): Promise<Presale[]> => {
    if (!signer || !userAddress) return [];

    try {
      const factory = new Contract(launchpadFactoryAddress, ABIS.FSKLaunchpadFactory, signer);
      const addresses: string[] = await factory.getPresales();

      const details: Presale[] = await Promise.all(
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
          };
        })
      );

      return details;
    } catch (err) {
      console.error("Failed to fetch presales:", err);
      return [];
    }
  };

  /* ---------- INITIAL LOAD ---------- */
  useEffect(() => {
    if (!signer || !userAddress) return;
    setLoading(true);

    fetchPresales().then((data) => {
      setPresales(data);
      setLoading(false);
    });
  }, [signer, userAddress]);

  /* ---------- TRANSACTION HANDLER ---------- */
  const handleTx = async (
    contractCall: () => Promise<any>,
    resetInputKey?: string
  ) => {
    if (!signer) return alert("Connect wallet first");

    try {
      setTxPending(true);
      const tx = await contractCall();
      await tx.wait();
      alert("Transaction successful");

      if (resetInputKey) setContributions((prev) => ({ ...prev, [resetInputKey]: "" }));
      setPresales(await fetchPresales());
    } catch (err: any) {
      alert("Transaction failed: " + (err?.message || "Unknown error"));
      console.error(err);
    } finally {
      setTxPending(false);
    }
  };

  const formatNumber = (val: string) =>
    Number(val).toLocaleString(undefined, { maximumFractionDigits: 4 });

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
          <WalletConnectButton
            setProvider={setProvider}
            setSigner={setSigner}
            setUserAddress={setUserAddress}
          />
          <ThemeSwitch />
        </div>
      </header>

      <main className="launchpad-container">
        {loading && <p>Loading presales...</p>}
        {!loading && presales.length === 0 && <p>No presales found.</p>}

        {presales.map((p) => {
          const now = Math.floor(Date.now() / 1000);
          const status = p.finalized
            ? "Finalized"
            : now < p.startTime
            ? "Upcoming"
            : now > p.endTime
            ? "Ended"
            : "Active";

          const active = status === "Active";

          return (
            <div key={p.address} className="presale-card">
              <h3>
                {p.name} ({p.symbol})
              </h3>
              <p>Soft Cap: {formatNumber(p.softCap)}</p>
              <p>Hard Cap: {formatNumber(p.hardCap)}</p>
              <p>Total Raised: {formatNumber(p.totalRaised)}</p>
              <p>Your Contribution: {formatNumber(p.userContribution)}</p>
              <p>Status: {status}</p>

              {active && (
                <>
                  <input
                    type="number"
                    placeholder="Amount in BNB"
                    value={contributions[p.address] || ""}
                    onChange={(e) =>
                      setContributions((prev) => ({
                        ...prev,
                        [p.address]: e.target.value
                      }))
                    }
                    disabled={txPending}
                  />
                  <button
                    onClick={() =>
                      handleTx(
                        () =>
                          new Contract(p.address, PRESALE_ABI, signer!).contribute({
                            value: ethers.parseEther(contributions[p.address] || "0")
                          }),
                        p.address
                      )
                    }
                    disabled={txPending || !contributions[p.address]}
                  >
                    {txPending ? "Processing..." : "Contribute"}
                  </button>
                </>
              )}

              {p.finalized && Number(p.userContribution) > 0 && (
                <button
                  onClick={() =>
                    handleTx(() =>
                      new Contract(p.address, PRESALE_ABI, signer!).claim()
                    )
                  }
                  disabled={txPending}
                >
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
