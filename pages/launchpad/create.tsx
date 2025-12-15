 "use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import WalletConnectButton from "../../components/WalletConnectButton";
import ThemeSwitch from "../../components/ThemeSwitch";
import {
  launchpadFactoryAddress,
  FSKLaunchpadFactoryABI,
} from "../../utils/constants";
import "../../styles/launchpad.css";

const LaunchpadDashboard = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [userAddress, setUserAddress] = useState("");
  const [presales, setPresales] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize provider and signer
  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      setSigner(tempSigner);
      tempSigner.getAddress().then(setUserAddress);
    }
  }, []);

  // Fetch all presales
  useEffect(() => {
    const fetchPresales = async () => {
      if (!signer) return;

      try {
        setLoading(true);
        const factory = new ethers.Contract(
          launchpadFactoryAddress,
          FSKLaunchpadFactoryABI,
          signer
        );
        const presalesList: string[] = await factory.getPresales();
        setPresales(presalesList);
      } catch (err) {
        console.error("Error fetching presales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresales();
  }, [signer]);

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
        <div className="launchpad-header-actions">
          <h2>All Presales</h2>
          <Link href="/launchpad/create">
            <button className="create-presale-btn">Create Presale</button>
          </Link>
        </div>

        {loading ? (
          <p>Loading presales...</p>
        ) : presales.length === 0 ? (
          <p>No presales found.</p>
        ) : (
          <ul className="presale-list">
            {presales.map((address) => (
              <li key={address} className="presale-item">
                <Link href={`/launchpad/project/${address}`}>
                  <span>Presale: {address}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default LaunchpadDashboard;
