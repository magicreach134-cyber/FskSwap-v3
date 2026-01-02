"use client";

import { useEffect, useMemo, useState } from "react";
import { Contract, BrowserProvider, JsonRpcSigner, ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { launchpadFactoryAddress, ABIS } from "@/utils/constants";
import "../../styles/launchpad.css";

interface Presale {
  address: string;
  softCap: string;
  hardCap: string;
  totalRaised: string;
  userContribution: string;
  startTime: number;
  endTime: number;
  finalized: boolean;
  name: string;
  symbol: string;
}

const PRESALE_ABI = [
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
  "function claim()",
];

export default function LaunchpadPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const signer: JsonRpcSigner | null = useMemo(() => {
    if (!walletClient) return null;
    const provider = new BrowserProvider(walletClient.transport);
    return provider.getSigner(walletClient.account.address);
  }, [walletClient]);

  const [presales, setPresales] = useState<Presale[]>([]);
  const [contributions, setContributions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);

  const fetchPresales = async () => {
    if (!signer || !address) return;

    const factory = new Contract(
      launchpadFactoryAddress,
      ABIS.FSKLaunchpadFactory,
      signer
    );

    const addresses: string[] = await factory.getPresales();

    const data = await Promise.all(
      addresses.map(async (addr) => {
        const c = new Contract(addr, PRESALE_ABI, signer);
        const [
          softCap,
          hardCap,
          totalRaised,
          startTime,
          endTime,
          userContribution,
          finalized,
          name,
          symbol,
        ] = await Promise.all([
          c.softCap(),
          c.hardCap(),
          c.totalRaised(),
          c.startTime(),
          c.endTime(),
          c.contributions(address),
          c.finalized(),
          c.name(),
          c.symbol(),
        ]);

        return {
          address: addr,
          softCap: ethers.formatEther(softCap),
          hardCap: ethers.formatEther(hardCap),
          totalRaised: ethers.formatEther(totalRaised),
          userContribution: ethers.formatEther(userContribution),
          startTime: Number(startTime),
          endTime: Number(endTime),
          finalized,
          name,
          symbol,
        };
      })
    );

    setPresales(data);
  };

  useEffect(() => {
    if (!isConnected) return;
    setLoading(true);
    fetchPresales().finally(() => setLoading(false));
  }, [isConnected, signer]);

  return (
    <div className="launchpad-page">
      <header className="launchpad-header">
        <span>FSKSwap Launchpad</span>
        <ConnectButton />
      </header>

      <main>
        {loading && <p>Loading...</p>}
        {!loading &&
          presales.map((p) => (
            <div key={p.address}>
              <h3>
                {p.name} ({p.symbol})
              </h3>
              <p>Raised: {p.totalRaised}</p>

              {!p.finalized && (
                <>
                  <input
                    value={contributions[p.address] || ""}
                    onChange={(e) =>
                      setContributions((pvs) => ({
                        ...pvs,
                        [p.address]: e.target.value,
                      }))
                    }
                  />
                  <button
                    disabled={txPending}
                    onClick={async () => {
                      setTxPending(true);
                      await new Contract(p.address, PRESALE_ABI, signer!).contribute({
                        value: ethers.parseEther(contributions[p.address]),
                      });
                      await fetchPresales();
                      setTxPending(false);
                    }}
                  >
                    Contribute
                  </button>
                </>
              )}
            </div>
          ))}
      </main>
    </div>
  );
}
