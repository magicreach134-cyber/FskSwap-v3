// hooks/useLocker.ts
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKMegaLocker, FSKMegaLockerABI } from "../utils/constants";
import ERC20ABI from "../utils/abis/ERC20.json";

const useLocker = (signer?: ethers.Signer) => {
  const [lockerContract, setLockerContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (signer) {
      try {
        const contract = new ethers.Contract(FSKMegaLocker, FSKMegaLockerABI, signer);
        setLockerContract(contract);
      } catch (err) {
        console.error("Failed to initialize locker contract:", err);
      }
    }
  }, [signer]);

  // Helper: get decimals of a token
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    if (!signer) return 18;
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, signer);
      const decimals: number = await tokenContract.decimals();
      return decimals;
    } catch (err) {
      console.error("getTokenDecimals error:", err);
      return 18; // fallback
    }
  };

  // ---------------- Locks ----------------
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

  const getLock = async (lockId: number) => {
    if (!lockerContract) return null;
    try {
      const lock = await lockerContract.getLock(lockId);
      const decimals = await getTokenDecimals(lock.token);
      return {
        lockerOwner: lock.lockerOwner,
        token: lock.token,
        amount: ethers.utils.formatUnits(lock.amount, decimals),
        unlockTime: lock.unlockTime.toNumber(),
        withdrawn: lock.withdrawn,
      };
    } catch (err) {
      console.error("getLock error:", err);
      return null;
    }
  };

  const withdrawFromLock = async (lockId: number, to: string, amount: string) => {
    if (!lockerContract) throw new Error("Locker contract not initialized");
    try {
      const lock = await lockerContract.getLock(lockId);
      const decimals = await getTokenDecimals(lock.token);
      const tx = await lockerContract.withdrawFromLock(
        lockId,
        to,
        ethers.utils.parseUnits(amount, decimals)
      );
      return await tx.wait();
    } catch (err) {
      console.error("withdrawFromLock error:", err);
      throw err;
    }
  };

  // ---------------- Vestings ----------------
  const getBeneficiaryVestings = async (account: string): Promise<number[]> => {
    if (!lockerContract) return [];
    try {
      const vestIds: ethers.BigNumber[] = await lockerContract.getBeneficiaryVestings(account);
      return vestIds.map((id) => id.toNumber());
    } catch (err) {
      console.error("getBeneficiaryVestings error:", err);
      return [];
    }
  };

  const getVesting = async (vestId: number) => {
    if (!lockerContract) return null;
    try {
      const v = await lockerContract.vestings(vestId);
      const decimals = await getTokenDecimals(v.token);
      return {
        beneficiary: v.beneficiary,
        token: v.token,
        amount: ethers.utils.formatUnits(v.amount, decimals),
        start: v.start.toNumber(),
        duration: v.duration.toNumber(),
        claimed: ethers.utils.formatUnits(v.claimed, decimals),
      };
    } catch (err) {
      console.error("getVesting error:", err);
      return null;
    }
  };

  const claimVesting = async (vestId: number) => {
    if (!lockerContract) throw new Error("Locker contract not initialized");
    try {
      const tx = await lockerContract.withdrawFromVesting(vestId);
      return await tx.wait();
    } catch (err) {
      console.error("claimVesting error:", err);
      throw err;
    }
  };

  return {
    lockerContract,
    // Locks
    getOwnerLocks,
    getLock,
    withdrawFromLock,
    // Vestings
    getBeneficiaryVestings,
    getVesting,
    claimVesting,
  };
};

export default useLocker;
