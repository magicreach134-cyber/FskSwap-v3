// hooks/useLocker.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FSKMegaLockerABI from "../utils/abis/FSKMegaLocker.json";
import { CONTRACTS } from "../utils/constants";

const useLocker = (signer: ethers.Signer | null) => {
  const [lockerContract, setLockerContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      try {
        const contract = new ethers.Contract(CONTRACTS.FSKMegaLocker, FSKMegaLockerABI, signer);
        setLockerContract(contract);
      } catch (err) {
        console.error("Failed to initialize FSKMegaLocker contract:", err);
      }
    }
  }, [signer]);

  // Get all lock IDs for a specific owner
  const getOwnerLocks = async (owner: string): Promise<number[]> => {
    if (!lockerContract) return [];
    try {
      const locks: ethers.BigNumber[] = await lockerContract.getOwnerLocks(owner);
      return locks.map((bn) => bn.toNumber());
    } catch (err) {
      console.error("getOwnerLocks error:", err);
      return [];
    }
  };

  // Get lock details by lockId
  const getLock = async (lockId: number) => {
    if (!lockerContract) return null;
    try {
      const lock = await lockerContract.getLock(lockId);
      return {
        lockerOwner: lock.lockerOwner,
        token: lock.token,
        amount: ethers.utils.formatUnits(lock.amount, 18),
        unlockTime: lock.unlockTime.toNumber(),
        withdrawn: lock.withdrawn,
      };
    } catch (err) {
      console.error("getLock error:", err);
      return null;
    }
  };

  // Get vesting details by vestId
  const getVesting = async (vestId: number) => {
    if (!lockerContract) return null;
    try {
      const vest = await lockerContract.vestings(vestId);
      return {
        beneficiary: vest.beneficiary,
        token: vest.token,
        amount: ethers.utils.formatUnits(vest.amount, 18),
        start: vest.start.toNumber(),
        duration: vest.duration.toNumber(),
        claimed: ethers.utils.formatUnits(vest.claimed, 18),
      };
    } catch (err) {
      console.error("getVesting error:", err);
      return null;
    }
  };

  // Withdraw from a lock
  const withdrawFromLock = async (lockId: number, to: string, amount: string) => {
    if (!lockerContract) throw new Error("Locker contract not initialized");
    try {
      const tx = await lockerContract.withdrawFromLock(
        lockId,
        to,
        ethers.utils.parseUnits(amount, 18)
      );
      return await tx.wait();
    } catch (err) {
      console.error("withdrawFromLock error:", err);
      throw err;
    }
  };

  return { lockerContract, getOwnerLocks, getLock, getVesting, withdrawFromLock };
};

export default useLocker;
