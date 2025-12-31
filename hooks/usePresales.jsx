"use client";

import { useState, useEffect } from "react";
import { Contract, BrowserProvider, JsonRpcSigner } from "ethers";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI } from "../utils/constants";

interface Presale {
  address: string;
  token: string;
  softCap: bigint;
  hardCap: bigint;
  totalRaised: bigint;
  startTime: number;
  endTime: number;
  userContribution: bigint;
  finalized: boolean;
  status: "upcoming" | "active" | "ended";
  contract: Contract;
}

const usePresales = (
  provider: BrowserProvider | null,
  userAddress: string | null
) => {
  const [presales, setPresales] = useState<Presale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provider || !userAddress) return;

    const fetchPresales = async () => {
      setLoading(true);
      try {
        const signer: JsonRpcSigner = provider.getSigner();
        const factory = new Contract(
          launchpadFactoryAddress,
          FSKLaunchpadFactoryABI,
          signer
        );

        const presaleAddresses: string[] = await factory.getPresales();

        const presaleDetails: Presale[] = await Promise.all(
          presaleAddresses.map(async (addr) => {
            const presaleContract = new Contract(addr, [
              "function token() view returns (address)",
              "function softCap() view returns (uint256)",
              "function hardCap() view returns (uint256)",
              "function totalRaised() view returns (uint256)",
              "function startTime() view returns (uint256)",
              "function endTime() view returns (uint256)",
              "function contributions(address) view returns (uint256)",
              "function finalized() view returns (bool)",
            ], signer);

            const [
              token,
              softCap,
              hardCap,
              totalRaised,
              startTime,
              endTime,
              userContribution,
              finalized
            ] = await Promise.all([
              presaleContract.token(),
              presaleContract.softCap(),
              presaleContract.hardCap(),
              presaleContract.totalRaised(),
              presaleContract.startTime(),
              presaleContract.endTime(),
              presaleContract.contributions(userAddress),
              presaleContract.finalized(),
            ]);

            const now = Math.floor(Date.now() / 1000);
            const status: "upcoming" | "active" | "ended" = now < startTime
              ? "upcoming"
              : now >= startTime && now <= endTime
              ? "active"
              : "ended";

            return {
              address: addr,
              token,
              softCap,
              hardCap,
              totalRaised,
              startTime: Number(startTime),
              endTime: Number(endTime),
              userContribution,
              finalized,
              status,
              contract: presaleContract,
            };
          })
        );

        setPresales(presaleDetails);
      } catch (err) {
        console.error("usePresales error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresales();
  }, [provider, userAddress]);

  const activePresales = presales.filter((p) => p.status === "active");
  const upcomingPresales = presales.filter((p) => p.status === "upcoming");

  return { presales, activePresales, upcomingPresales, loading };
};

export default usePresales;
