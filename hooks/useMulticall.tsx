"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

/* ======================================================
   MULTICALL ABI (Multicall2-compatible)
   ====================================================== */

const MULTICALL_ABI = [
  "function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) view returns (tuple(bool success, bytes returnData)[] memory)"
];

/* ======================================================
   TYPES
   ====================================================== */

export interface MulticallCall {
  target: string;
  iface: ethers.utils.Interface;
  method: string;
  args?: any[];
}

export interface MulticallResult<T = any> {
  success: boolean;
  data: T | null;
}

export interface MulticallConfig {
  requireSuccess?: boolean; // default false
  chainId?: number;         // optional network guard
}

/* ======================================================
   useMulticall
   ====================================================== */

const useMulticall = (
  provider?: ethers.providers.Web3Provider | null,
  multicallAddress?: string
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerRef = useRef(provider);

  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  /* ---------------- EXECUTE ---------------- */

  const execute = useCallback(
    async <T = any>(
      calls: MulticallCall[],
      config?: MulticallConfig
    ): Promise<MulticallResult<T>[]> => {
      if (!providerRef.current) {
        throw new Error("Provider not available");
      }

      if (!multicallAddress) {
        throw new Error("Multicall address not set");
      }

      if (calls.length === 0) {
        return [];
      }

      const provider = providerRef.current;

      try {
        setLoading(true);
        setError(null);

        // Optional chain guard
        if (config?.chainId) {
          const network = await provider.getNetwork();
          if (network.chainId !== config.chainId) {
            throw new Error("Wrong network");
          }
        }

        const multicall = new ethers.Contract(
          multicallAddress,
          MULTICALL_ABI,
          provider
        );

        const encodedCalls = calls.map((c) => ({
          target: ethers.utils.getAddress(c.target),
          callData: c.iface.encodeFunctionData(
            c.method,
            c.args ?? []
          )
        }));

        const requireSuccess = config?.requireSuccess ?? false;

        const results: { success: boolean; returnData: string }[] =
          await multicall.tryAggregate(requireSuccess, encodedCalls);

        return results.map((res, i) => {
          if (!res.success || res.returnData === "0x") {
            return { success: false, data: null };
          }

          try {
            const decoded = calls[i].iface.decodeFunctionResult(
              calls[i].method,
              res.returnData
            );

            // Normalize single return values
            const data =
              decoded.length === 1 ? decoded[0] : decoded;

            return { success: true, data: data as T };
          } catch {
            return { success: false, data: null };
          }
        });
      } catch (e: any) {
        setError(e?.message || "Multicall failed");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [multicallAddress]
  );

  return {
    execute,
    loading,
    error
  };
};

export default useMulticall;
