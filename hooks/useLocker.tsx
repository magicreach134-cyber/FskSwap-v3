"use client";

import { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";

import { FSKMegaLocker, FSKMegaLockerABI, DEFAULT_BNB_RPC } from "../utils/constants";
import ERC20ABI from "../utils/abis/ERC20.json";

export interface Lock {
  lockerOwner: string;
  token: string;
  amount: string;
  unlockTime: number;
  withdrawn: boolean;
}

export interface Vesting {
  beneficiary: string;
  token: string;
  amount: string;
  start: number;
  duration: number;
  claimed: string;
}

const useLocker = (signer?: ethers.Signer | null) => {
  const [lockerContract, setLockerContract] = useState<Contract | null>(null);

  /* ---------- INIT CONTRACT ---------- */
  useEffect(() => {
    const provider = signer ?? new ethers.BrowserProvider(DEFAULT_BNB_RPC);
    try {
      const contract = new Contract(FSKMegaLocker, FSKMegaLockerABI, signer ?? provider);
      setLockerContract(contract);
    } catch (err) {
      console.error("Failed to initialize locker contract:", err);
      setLockerContract(null);
    }
  }, [signer]);

  /* ---------- TOKEN DECIMALS ---------- */
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    try {
      const tokenContract = new Contract(tokenAddress, ERC20ABI, signer ?? new ethers.BrowserProvider(DEFAULT_BNB_RPC));
      return Number(await tokenContract.decimals());
    } catch {
      return 18;
    }
  };

  /* ---------- LOCKS ---------- */
  const getOwnerLocks = async (owner: string): Promise<number[]> => {
    if (!lockerContract) return [];
    try {
      const locks: bigint[] = await lockerContract.getOwnerLocks(owner);
      return locks.map(Number);
    } catch {
      return [];
    }
  };

  const getLock = async (lockId: number): Promise<Lock | null> => {
    if (!lockerContract) return null;
    try {
      const lock = await lockerContract.getLock(lockId);
      const decimals = await getTokenDecimals(lock.token);
      return {
        lockerOwner: lock.lockerOwner,
        token: lock.token,
        amount: ethers.formatUnits(lock.amount, decimals),
        unlockTime: Number(lock.unlockTime),
        withdrawn: lock.withdrawn,
      };
    } catch {
      return null;
    }
  };

  const withdrawFromLock = async (lockId: number, to: string, amount: string) => {
    if (!lockerContract) throw new Error("Locker contract not initialized");
    const lock = await lockerContract.getLock(lockId);
    const decimals = await getTokenDecimals(lock.token);
    const tx = await lockerContract.withdrawFromLock(lockId, to, ethers.parseUnits(amount, decimals));
    return await tx.wait();
  };

  /* ---------- VESTINGS ---------- */
  const getBeneficiaryVestings = async (account: string): Promise<number[]> => {
    if (!lockerContract) return [];
    try {
      const vestIds: bigint[] = await lockerContract.getBeneficiaryVestings(account);
      return vestIds.map(Number);
    } catch {
      return [];
    }
  };

  const getVesting = async (vestId: number): Promise<Vesting | null> => {
    if (!lockerContract) return null;
    try {
      const v = await lockerContract.vestings(vestId);
      const decimals = await getTokenDecimals(v.token);
      return {
        beneficiary: v.beneficiary,
        token: v.token,
        amount: ethers.formatUnits(v.amount, decimals),
        start: Number(v.start),
        duration: Number(v.duration),
        claimed: ethers.formatUnits(v.claimed, decimals),
      };
    } catch {
      return null;
    }
  };

  const claimVesting = async (vestId: number) => {
    if (!lockerContract) throw new Error("Locker contract not initialized");
    const tx = await lockerContract.withdrawFromVesting(vestId);
    return await tx.wait();
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
