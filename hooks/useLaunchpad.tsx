// hooks/useLaunchpad.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { launchpadFactoryAddress, FSKLaunchpadFactoryABI } from "../utils/constants";

export const useLaunchpad = (signer: ethers.Signer | null, userAddress: string | null) => {
  const [presales, setPresales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signer || !userAddress) return;

    const fetchPresales = async () => {
      setLoading(true);
      try {
        const factory = new ethers.Contract(launchpadFactoryAddress, FSKLaunchpadFactoryABI, signer);
        const addresses = await factory.getPresales();

        const details = await Promise.all(addresses.map(async (addr: string) => {
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

          return {
            address: addr,
            token: await presale.token(),
            softCap: await presale.softCap(),
            hardCap: await presale.hardCap(),
            totalRaised: await presale.totalRaised(),
            startTime: await presale.startTime(),
            endTime: await presale.endTime(),
            userContribution: await presale.contributions(userAddress),
            finalized: await presale.finalized(),
            contract: presale
          };
        }));

        setPresales(details);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresales();
  }, [signer, userAddress]);

  return { presales, loading };
};
