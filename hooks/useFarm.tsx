"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  FSKFarmFactory,
  FSKFarmFactoryABI,
  FSKFarmABI
} from "../utils/constants";

export interface FarmInfo {
  address: string;
  name: string;
  symbol: string;
  claimable: Record<string, ethers.BigNumber>;
}

const useFarm = (signer?: ethers.Signer | null) => {
  const [farms, setFarms] = useState<FarmInfo[]>([]);
  const [factory, setFactory] = useState<ethers.Contract | null>(null);

  /* -------------------------------------------------------
     Init Factory
  ------------------------------------------------------- */
  useEffect(() => {
    if (!signer) return;

    const contract = new ethers.Contract(
      FSKFarmFactory,
      FSKFarmFactoryABI,
      signer
    );

    setFactory(contract);
  }, [signer]);

  /* -------------------------------------------------------
     Load Farms
  ------------------------------------------------------- */
  useEffect(() => {
    if (!factory || !signer) return;

    const loadFarms = async () => {
      try {
        const user = await signer.getAddress();
        const farmCount: number = await factory.totalFarms();

        const farmData: FarmInfo[] = [];

        for (let i = 0; i < farmCount; i++) {
          const farmAddress: string = await factory.farms(i);
          const farm = new ethers.Contract(farmAddress, FSKFarmABI, signer);

          const name = await farm.name();
          const symbol = await farm.symbol();
          const pending = await farm.pendingReward(user);

          farmData.push({
            address: farmAddress,
            name,
            symbol,
            claimable: { [user]: pending }
          });
        }

        setFarms(farmData);
      } catch (err) {
        console.error("Failed to load farms:", err);
      }
    };

    loadFarms();
  }, [factory, signer]);

  /* -------------------------------------------------------
     Claim Rewards
  ------------------------------------------------------- */
  const claim = async (farmAddress: string) => {
    if (!signer) throw new Error("Wallet not connected");

    const farm = new ethers.Contract(
      farmAddress,
      FSKFarmABI,
      signer
    );

    const tx = await farm.claimRewards();
    return await tx.wait();
  };

  return {
    farms,
    claim
  };
};

export default useFarm;
