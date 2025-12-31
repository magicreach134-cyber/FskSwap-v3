"use client";

import { useState, useEffect } from "react";
import { Contract, BrowserProvider, JsonRpcSigner, parseUnits, formatUnits } from "ethers";

import {
  FSKMegaLocker,
  FSKMegaLockerABI,
  DEFAULT_BNB_RPC
} from "../utils/constants";

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

const useLocker = (provider: BrowserProvider | null) => {
  const [lockerContract, setLockerContract] = useState<Contract | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  /* ---------- INIT CONTRACT ---------- */
  useEffect(() => {
    const init = async () => {
      try {
        const readProvider = provider ?? new BrowserProvider(DEFAULT_BNB_RPC);
        const signerInstance = provider?.getSigner() ?? null;
        setSigner(signerInstance);

        const contract = new Contract(
          FSKMegaLocker,
          FSKMegaLockerABI,
          signerInstance ?? readProvider
        );

        setLockerContract(contract);
      } catch (err) {
        console.error("Failed to initialize locker contract:", err);
        setLockerContract(null);
      }
    };

    init();
  }, [provider]);

  /* ---------- TOKEN DECIMALS ---------- */
  const getTokenDecimals = async (tokenAddress: string): Promise<number> => {
    try {
      const readProvider = provider ?? new BrowserProvider(DEFAULT_BNB_RPC);
      const token = new Contract(tokenAddress, ERC20ABI, signer ?? readProvider);
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
      return ids.map(id => Number(id));
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
        withdrawn: lock.withdrawn
      };
    } catch {
      return null;
    }
  };

  const withdrawFromLock = async (lockId: number, to: string, amount: string) => {
    if (!lockerContract || !signer) throw new Error("Locker contract not connected to signer");

    const lock = await lockerContract.getLock(lockId);
    const decimals = await getTokenDecimals(lock.token);

    const tx = await lockerContract.withdrawFromLock(
      lockId,
      to,
      parseUnits(amount, decimals)
    );

    return await tx.wait();
  };

  /* ---------- VESTINGS ---------- */
  const getBeneficiaryVestings = async (account: string): Promise<number[]> => {
    if (!lockerContract) return [];
    try {
      const ids: bigint[] = await lockerContract.getBeneficiaryVestings(account);
      return ids.map(id => Number(id));
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
        claimed: formatUnits(v.claimed, decimals)
      };
    } catch {
      return null;
    }
  };

  const claimVesting = async (vestId: number) => {
    if (!lockerContract || !signer) throw new Error("Locker contract not connected to signer");

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
    claimVesting
  };
};

export default useLocker;
