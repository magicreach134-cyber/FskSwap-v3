"use client";

import { useEffect, useState } from "react";
import { Contract, type Signer, formatUnits, parseUnits } from "ethers";
import {
  FSKMegaLockerAddress,
  FSKMegaLockerABI,
  DEFAULT_BNB_RPC,
} from "@/utils/constants"; // fixed path
import ERC20ABI from "@/utils/abis/ERC20.json"; // ensure correct relative path

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

interface UseLockerProps {
  provider?: any; // ethers provider or wagmi provider
  signer?: Signer | null;
}

const useLocker = ({ provider, signer }: UseLockerProps) => {
  const [lockerContract, setLockerContract] = useState<Contract | null>(null);

  /* ---------- INIT CONTRACT ---------- */
  useEffect(() => {
    if (!provider) return;

    try {
      const contract = new Contract(FSKMegaLockerAddress, FSKMegaLockerABI, provider);
      setLockerContract(contract);
    } catch (err) {
      console.error("Locker contract init failed:", err);
      setLockerContract(null);
    }
  }, [provider]);

  /* ---------- HELPERS ---------- */
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    try {
      const token = new Contract(tokenAddress, ERC20ABI, provider);
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

  const withdrawFromLock = async (lockId: number, to: string, amount: string) => {
    if (!lockerContract || !signer) throw new Error("Contract or signer not initialized");
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

  const claimVesting = async (vestId: number) => {
    if (!lockerContract || !signer) throw new Error("Contract or signer not initialized");
    const writeContract = new Contract(FSKMegaLockerAddress, FSKMegaLockerABI, signer);
    const tx = await writeContract.withdrawFromVesting(vestId);
    return tx.wait();
  };

  return {
    lockerContract,
    getOwnerLocks,
    getLock,
    withdrawFromLock,
    getBeneficiaryVestings,
    getVesting,
    claimVesting,
  };
};

export default useLocker;
