// hooks/useFeeCollector.ts
"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { FSKFeeCollector, FSKFeeCollectorABI } from "../utils/constants";

const useFeeCollector = (provider?: ethers.providers.Web3Provider) => {
  const [collectedFees, setCollectedFees] = useState<any[]>([]);

  useEffect(() => {
    if (!provider) return;

    const feeCollectorContract = new ethers.Contract(
      FSKFeeCollector,
      FSKFeeCollectorABI,
      provider
    );

    // Listen for FeeCollected events
    const filter = feeCollectorContract.filters.FeeCollected();
    const onFeeCollected = (token: string, amount: ethers.BigNumber, feeType: string) => {
      setCollectedFees((prev) => [
        ...prev,
        { token, amount: ethers.utils.formatUnits(amount, 18), feeType },
      ]);
      console.log("Fee collected:", { token, amount: ethers.utils.formatUnits(amount, 18), feeType });
    };

    feeCollectorContract.on(filter, onFeeCollected);

    return () => {
      feeCollectorContract.off(filter, onFeeCollected);
    };
  }, [provider]);

  return { collectedFees };
};

export default useFeeCollector;
