// src/hooks/useLocker.ts
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FSKMegaLockerABI, FSKMegaLocker } from "../utils/constants";

export const useLocker = (signer: ethers.Signer | null, account: string | null) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [locks, setLocks] = useState<any[]>([]);

  useEffect(() => {
    if (!signer) return;
    setContract(new ethers.Contract(FSKMegaLocker, FSKMegaLockerABI, signer));
  }, [signer]);

  useEffect(() => {
    if (!contract || !account) return;
    const fetchLocks = async () => {
      const lockCount = await contract.getLockCount(account);
      const lockDetails = await Promise.all(
        Array.from({ length: Number(lockCount) }, (_, i) => contract.getLock(account, i))
      );
      setLocks(lockDetails);
    };
    fetchLocks();
  }, [contract, account]);

  return { locks };
};
