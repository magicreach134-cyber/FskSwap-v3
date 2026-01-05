"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Contract, type Signer, formatUnits, parseUnits, JsonRpcProvider } from "ethers";
import {
  FSKMegaLockerAddress,
  FSKMegaLockerABI,
  DEFAULT_BNB_RPC,
} from "@/utils/constants";
import ERC20ABI from "@/utils/abis/ERC20.json";

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

  /* ---------- READ CONTRACT ---------- */
  const readProvider = useMemo(() => provider ?? new JsonRpcProvider(DEFAULT_BNB_RPC), [provider]);

  useEffect(() => {
    try {
      const contract = new Contract(FSKMegaLockerAddress, FSKMegaLockerABI, readProvider);
      setLockerContract(contract);
    } catch (err) {
      console.error("Locker contract init failed:", err);
      setLockerContract(null);
    }
  }, [readProvider]);

  /* ---------- HELPERS ---------- */
  const getTokenDecimals = useCallback(
    async (tokenAddress: string) => {
      try {
        const token = new Contract(tokenAddress, ERC20ABI, readProvider);
        return Number(await token.decimals());
      } catch {
        return 18;
      }
    },
    [readProvider]
  );

  /* ---------- LOCKS ---------- */
  const getOwnerLocks = useCallback(
    async (owner: string): Promise<number[]> => {
      if (!lockerContract) return [];
      try {
        const ids: bigint[] = await lockerContract.getOwnerLocks(owner);
        return ids.map(Number);
      } catch {
        return [];
      }
    },
    [lockerContract]
  );

  const getLock = useCallback(
    async (lockId: number): Promise<Lock | null> => {
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
    },
    [lockerContract, getTokenDecimals]
  );

  const withdrawFromLock = useCallback(
    async (lockId: number, to: string, amount: string) => {
      if (!lockerContract || !signer) throw new Error("Contract or signer not initialized");
      const lock = await lockerContract.getLock(lockId);
      const decimals = await getTokenDecimals(lock.token);
      const writeContract = new Contract(FSKMegaLockerAddress, FSKMegaLockerABI, signer);
      const tx = await writeContract.withdrawFromLock(lockId, to, parseUnits(amount, decimals));
      return tx.wait();
    },
    [lockerContract, signer, getTokenDecimals]
  );

  /* ---------- VESTINGS ---------- */
  const getBeneficiaryVestings = useCallback(
    async (account: string): Promise<number[]> => {
      if (!lockerContract) return [];
      try {
        const ids: bigint[] = await lockerContract.getBeneficiaryVestings(account);
        return ids.map(Number);
      } catch {
        return [];
      }
    },
    [lockerContract]
  );

  const getVesting = useCallback(
    async (vestId: number): Promise<Vesting | null> => {
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
    },
    [lockerContract, getTokenDecimals]
  );

  const claimVesting = useCallback(
    async (vestId: number) => {
      if (!lockerContract || !signer) throw new Error("Contract or signer not initialized");
      const writeContract = new Contract(FSKMegaLockerAddress, FSKMegaLockerABI, signer);
      const tx = await writeContract.withdrawFromVesting(vestId);
      return tx.wait();
    },
    [lockerContract, signer]
  );

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
