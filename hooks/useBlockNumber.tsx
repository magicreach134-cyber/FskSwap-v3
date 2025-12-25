"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

/* ======================================================
   TYPES
   ====================================================== */

export interface BlockNumberState {
  blockNumber: number | null;
  lastUpdated: number | null;
}

/* ======================================================
   CONSTANTS
   ====================================================== */

const POLL_INTERVAL = 12_000; // 12s fallback polling (BNB-friendly)

/* ======================================================
   useBlockNumber
   ====================================================== */

const useBlockNumber = (
  provider?: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider | null
) => {
  const [state, setState] = useState<BlockNumberState>({
    blockNumber: null,
    lastUpdated: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerRef = useRef<typeof provider>(provider);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  /* ---------------- FETCH ---------------- */

  const fetchBlockNumber = useCallback(async () => {
    if (!providerRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const blockNumber = await providerRef.current.getBlockNumber();

      setState({
        blockNumber,
        lastUpdated: Date.now()
      });
    } catch (err: any) {
      setError(err?.message || "Failed to fetch block number");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- SUBSCRIBE ---------------- */

  useEffect(() => {
    if (!providerRef.current) return;

    const provider = providerRef.current;

    const onBlock = (blockNumber: number) => {
      setState({
        blockNumber,
        lastUpdated: Date.now()
      });
    };

    // Primary: websocket / provider events
    try {
      provider.on("block", onBlock);
    } catch {
      // ignore, fallback to polling
    }

    // Fallback polling (RPC-safe)
    pollRef.current = setInterval(fetchBlockNumber, POLL_INTERVAL);

    // Initial fetch
    fetchBlockNumber();

    return () => {
      try {
        provider.removeListener("block", onBlock);
      } catch {}

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [fetchBlockNumber]);

  /* ---------------- HELPERS ---------------- */

  const isReady = state.blockNumber !== null;

  const getDeadline = useCallback(
    (secondsFromNow: number): number | null => {
      if (!state.blockNumber || !providerRef.current) return null;

      // Use timestamp instead of guessing block time
      return Math.floor(Date.now() / 1000) + secondsFromNow;
    },
    [state.blockNumber]
  );

  return {
    blockNumber: state.blockNumber,
    lastUpdated: state.lastUpdated,
    loading,
    error,
    isReady,

    refresh: fetchBlockNumber,
    getDeadline
  };
};

export default useBlockNumber;
