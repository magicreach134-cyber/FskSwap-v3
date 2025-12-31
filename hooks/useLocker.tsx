"use client";

import { useEffect, useState } from "react";
import {
  Contract,
  BrowserProvider,
  JsonRpcProvider,
  parseUnits,
  formatUnits,
} from "ethers";

import {
  FSKMegaLocker,
  FSKMegaLockerABI,
  DEFAULT_BNB_RPC,
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

  /* ---------- INIT CONTRACT (READ MODE) ---------- */
  useEffect(() => {
    const init = async () => {
      try {
        const readProvider = provider
          ? provider
          : new JsonRpcProvider(DEFAULT_BNB_RPC);

        const contract = new Contract(
          FSKMegaLocker,
          FSKMegaLockerABI,
          readProvider
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
      const readProvider = provider
        ? provider
        : new JsonRpcProvider(DEFAULT_BNB_RPC);

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
        withdrawn: lock.withdrawn,
      };
    } catch {
      return null;
    }
  };

  const withdrawFromLock = async (
    lockId: number,
    to: string,
    amount: string
  ) => {
    if (!lockerContract || !provider) {
      throw new Error("Wallet not connected");
    }

    const signer = await provider.getSigner();
    const lock = await lockerContract.getLock(lockId);
    const decimals = await getTokenDecimals(lock.token);

    const tx = await lockerContract
      .connect(signer)
      .withdrawFromLock(lockId, to, parseUnits(amount, decimals));

    return await tx.wait();
  };

  /* ---------- VESTINGS ---------- */
  const getBeneficiaryVestings = async (
    account: string
  ): Promise<number[]> => {
    if (!lockerContract) return [];
    try {
      const ids: bigint[] =
        await lockerContract.getBeneficiaryVestings(account);
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
        claimed: formatUnits(v.claimed, decimals),
      };
    } catch {
      return null;
    }
  };

  const claimVesting = async (vestId: number) => {
    if (!lockerContract || !provider) {
      throw new Error("Wallet not connected");
    }

    const signer = await provider.getSigner();

    const tx = await lockerContract
      .connect(signer)
      .withdrawFromVesting(vestId);

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
