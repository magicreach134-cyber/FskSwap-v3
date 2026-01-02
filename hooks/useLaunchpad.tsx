// hooks/useLaunchpad.ts
import { useState, useEffect } from "react";
import { ethers, Signer, BigNumberish } from "ethers";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI } from "../utils/constants";

export interface Presale {
  address: string;
  token: string;
  softCap: string;
  hardCap: string;
  totalRaised: string;
  startTime: number;
  endTime: number;
  userContribution: string;
  finalized: boolean;
  contract: ethers.Contract;
}

export const useLaunchpad = (signer: Signer | null, userAddress: string | null) => {
  const [presales, setPresales] = useState<Presale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signer || !userAddress) return;

    const fetchPresales = async () => {
      setLoading(true);
      try {
        const factory = new ethers.Contract(
          launchpadFactoryAddress,
          FSKLaunchpadFactoryABI,
          signer
        );

        const addresses: string[] = await factory.getPresales();

        const details: Presale[] = await Promise.all(
          addresses.map(async (addr: string) => {
            const presale = new ethers.Contract(addr, [
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
              presale.token(),
              presale.softCap(),
              presale.hardCap(),
              presale.totalRaised(),
              presale.startTime(),
              presale.endTime(),
              presale.contributions(userAddress),
              presale.finalized(),
            ]);

            return {
              address: addr,
              token,
              softCap: ethers.formatUnits(softCap as BigNumberish, 18),
              hardCap: ethers.formatUnits(hardCap as BigNumberish, 18),
              totalRaised: ethers.formatUnits(totalRaised as BigNumberish, 18),
              startTime: Number(startTime),
              endTime: Number(endTime),
              userContribution: ethers.formatUnits(userContribution as BigNumberish, 18),
              finalized,
              contract: presale
            };
          })
        );

        setPresales(details);
      } catch (err) {
        console.error("Failed to fetch presales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresales();
  }, [signer, userAddress]);

  return { presales, loading };
};
