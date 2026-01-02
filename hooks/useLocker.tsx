"use client";

import { useEffect, useState } from "react";
import { Contract, BrowserProvider, JsonRpcProvider, Signer, parseUnits, formatUnits } from "ethers";

import { FSKMegaLockerAddress, FSKMegaLockerABI, DEFAULT_BNB_RPC } from "../utils/constants";
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

type ProviderLike = BrowserProvider | JsonRpcProvider | null;

const useLocker = (provider: ProviderLike) => {
  const [lockerContract, setLockerContract] = useState<Contract | null>(null);

  /* ---------- INIT CONTRACT ---------- */
  useEffect(() => {
    const init = async () => {
      try {
        const readProvider = provider ?? new JsonRpcProvider(DEFAULT_BNB_RPC);
        const contract = new Contract(FSKMegaLockerAddress, FSKMegaLockerABI, readProvider);
        setLockerContract(contract);
      } catch (err) {
        console.error("Locker init failed:", err);
        setLockerContract(null);
      }
    };
    init();
  }, [provider]);

  /* ---------- HELPERS ---------- */
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    try {
      const readProvider = provider ?? new JsonRpcProvider(DEFAULT_BNB_RPC);
      const token = new Contract(tokenAddress, ERC20ABI, readProvider);
      return Number(await token.decimals());
    } catch {
      return 18;
    }
  };

  /* ---------- LOCKS ---------- */
  const getOwnerLocks = async (owner: string): Promise<number[]> => {
    if (!lockerContract) return [];
    try {
      const ids: bigint[] = await lockerContract.getOwnerLocks(owner);
      return ids.map(Number);
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
        amount: formatUnits(lock.amount, decimals),
        unlockTime: Number(lock.unlockTime),
        withdrawn: lock.withdrawn,
      };
    } catch {
      return null;
    }
  };

  const withdrawFromLock = async (signer: Signer, lockId: number, to: string, amount: string) => {
    if (!lockerContract) throw new Error("Locker contract not initialized");
    const lock = await lockerContract.getLock(lockId);
    const decimals = await getTokenDecimals(lock.token);
    const writeContract = new Contract(FSKMegaLockerAddress, FSKMegaLockerABI, signer);
    const tx = await writeContract.withdrawFromLock(lockId, to, parseUnits(amount, decimals));
    return tx.wait();
  };

  /* ---------- VESTINGS ---------- */
  const getBeneficiaryVestings = async (account: string): Promise<number[]> => {
    if (!lockerContract) return [];
    try {
      const ids: bigint[] = await lockerContract.getBeneficiaryVestings(account);
      return ids.map(Number);
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
        amount: formatUnits(v.amount, decimals),
        start: Number(v.start),
        duration: Number(v.duration),
        claimed: formatUnits(v.claimed, decimals),
      };
    } catch {
      return null;
    }
  };

  const claimVesting = async (signer: Signer, vestId: number) => {
    if (!lockerContract) throw new Error("Locker contract not initialized");
    const writeContract = new Contract(FSKMegaLockerAddress, FSKMegaLockerABI, signer);
    const tx = await writeContract.withdrawFromVesting(vestId);
    return tx.wait();
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
