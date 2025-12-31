"use client";

import { useState, useEffect } from "react";
import {
  Contract,
  BrowserProvider,
  JsonRpcProvider,
} from "ethers";

import {
  launchpadFactoryAddress,
  FSKLaunchpadFactoryABI,
  DEFAULT_BNB_RPC,
} from "../utils/constants";

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

const PRESALE_ABI = [
  "function token() view returns (address)",
  "function softCap() view returns (uint256)",
  "function hardCap() view returns (uint256)",
  "function totalRaised() view returns (uint256)",
  "function startTime() view returns (uint256)",
  "function endTime() view returns (uint256)",
  "function contributions(address) view returns (uint256)",
  "function finalized() view returns (bool)",
];

const usePresales = (
  provider: BrowserProvider | null,
  userAddress: string | null
) => {
  const [presales, setPresales] = useState<Presale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPresales = async () => {
      setLoading(true);

      try {
        const readProvider = provider
          ? provider
          : new JsonRpcProvider(DEFAULT_BNB_RPC);

        const factory = new Contract(
          launchpadFactoryAddress,
          FSKLaunchpadFactoryABI,
          readProvider
        );

        const presaleAddresses: string[] = await factory.getPresales();

        const presaleDetails: Presale[] = await Promise.all(
          presaleAddresses.map(async (addr) => {
            const presaleContract = new Contract(
              addr,
              PRESALE_ABI,
              readProvider
            );

            const [
              token,
              softCap,
              hardCap,
              totalRaised,
              startTime,
              endTime,
              finalized,
              userContribution,
            ] = await Promise.all([
              presaleContract.token(),
              presaleContract.softCap(),
              presaleContract.hardCap(),
              presaleContract.totalRaised(),
              presaleContract.startTime(),
              presaleContract.endTime(),
              presaleContract.finalized(),
              userAddress
                ? presaleContract.contributions(userAddress)
                : 0n,
            ]);

            const now = Math.floor(Date.now() / 1000);
            const status: "upcoming" | "active" | "ended" =
              now < Number(startTime)
                ? "upcoming"
                : now <= Number(endTime)
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

  const activePresales = presales.filter(p => p.status === "active");
  const upcomingPresales = presales.filter(p => p.status === "upcoming");

  return {
    presales,
    activePresales,
    upcomingPresales,
    loading,
  };
};

export default usePresales;
