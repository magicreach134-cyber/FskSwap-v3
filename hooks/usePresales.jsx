"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI } from "../utils/constants";

const usePresales = (provider, userAddress) => {
  const [presales, setPresales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!provider || !userAddress) return;

    const fetchPresales = async () => {
      setLoading(true);
      try {
        const signer = provider.getSigner();
        const factory = new ethers.Contract(
          launchpadFactoryAddress,
          FSKLaunchpadFactoryABI,
          signer
        );

        const presaleAddresses = await factory.getPresales();

        const presaleDetails = await Promise.all(
          presaleAddresses.map(async (addr) => {
            const presaleContract = new ethers.Contract(addr, [
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
            const status = now < startTime
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
              startTime,
              endTime,
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
