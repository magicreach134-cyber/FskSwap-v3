"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BigNumber, ethers } from "ethers";

/* ======================================================
   TYPES
   ====================================================== */

export interface GasPriceTier {
  wei: BigNumber;
  gwei: string;
}

export interface GasPriceState {
  slow: GasPriceTier;
  standard: GasPriceTier;
  fast: GasPriceTier;
  lastUpdated: number;
}

/* ======================================================
   CONSTANTS
   ====================================================== */

const REFRESH_INTERVAL = 15_000; // 15 seconds

/* ======================================================
   useGasPrice
   ====================================================== */

const useGasPrice = (
  provider?: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider | null
) => {
  const [gas, setGas] = useState<GasPriceState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerRef = useRef(provider);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  /* ---------------- FETCH ---------------- */

  const fetchGasPrice = useCallback(async () => {
    if (!providerRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const baseGas = await providerRef.current.getGasPrice();

      // BNB chain-friendly multipliers
      const slow = baseGas.mul(90).div(100);
      const standard = baseGas;
      const fast = baseGas.mul(120).div(100);

      setGas({
        slow: toTier(slow),
        standard: toTier(standard),
        fast: toTier(fast),
        lastUpdated: Date.now()
      });
    } catch (err: any) {
      setError(err?.message || "Failed to fetch gas price");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- AUTO REFRESH ---------------- */

  useEffect(() => {
    if (!providerRef.current) return;

    fetchGasPrice();

    timerRef.current = setInterval(fetchGasPrice, REFRESH_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchGasPrice]);

  /* ---------------- HELPERS ---------------- */

  const getGasForSpeed = useCallback(
    (speed: "slow" | "standard" | "fast"): BigNumber | null => {
      if (!gas) return null;
      return gas[speed].wei;
    },
    [gas]
  );

  return {
    gas,
    loading,
    error,

    slow: gas?.slow ?? null,
    standard: gas?.standard ?? null,
    fast: gas?.fast ?? null,

    getGasForSpeed,
    refresh: fetchGasPrice
  };
};

/* ======================================================
   UTIL
   ====================================================== */

function toTier(value: BigNumber): GasPriceTier {
  return {
    wei: value,
    gwei: ethers.utils.formatUnits(value, "gwei")
  };
}

export default useGasPrice;
