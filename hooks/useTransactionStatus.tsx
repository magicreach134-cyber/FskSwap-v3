"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

/* ======================================================
   TYPES
   ====================================================== */

export type TxPhase =
  | "idle"
  | "signing"
  | "pending"
  | "confirmed"
  | "failed";

export interface TrackedTx {
  hash: string;
  phase: TxPhase;
  confirmations: number;
  receipt?: ethers.providers.TransactionReceipt;
  error?: string;
  createdAt: number;
}

export interface TxConfig {
  confirmations?: number; // default: 1
  chainId?: number;       // optional chain guard
}

/* ======================================================
   DEFAULTS
   ====================================================== */

const DEFAULT_CONFIRMATIONS = 1;

/* ======================================================
   useTransactionStatus
   ====================================================== */

const useTransactionStatus = (
  provider?: ethers.providers.Web3Provider | null
) => {
  const [transactions, setTransactions] = useState<Record<string, TrackedTx>>(
    {}
  );

  const providerRef = useRef<typeof provider>(provider);

  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  /* ---------------- HELPERS ---------------- */

  const updateTx = useCallback(
    (hash: string, updates: Partial<TrackedTx>) => {
      setTransactions((prev) => ({
        ...prev,
        [hash]: {
          ...prev[hash],
          ...updates
        }
      }));
    },
    []
  );

  /* ---------------- TRACK TX ---------------- */

  const trackTransaction = useCallback(
    async (
      txPromise: Promise<ethers.providers.TransactionResponse>,
      config?: TxConfig
    ): Promise<ethers.providers.TransactionReceipt | null> => {
      if (!providerRef.current) {
        throw new Error("Provider not available");
      }

      const provider = providerRef.current;
      const requiredConfirmations =
        config?.confirmations ?? DEFAULT_CONFIRMATIONS;

      try {
        // Signing phase
        const tx = await txPromise;

        // Optional chain guard
        if (config?.chainId) {
          const network = await provider.getNetwork();
          if (network.chainId !== config.chainId) {
            throw new Error("Wrong network");
          }
        }

        setTransactions((prev) => ({
          ...prev,
          [tx.hash]: {
            hash: tx.hash,
            phase: "pending",
            confirmations: 0,
            createdAt: Date.now()
          }
        }));

        // Wait for confirmations
        const receipt = await tx.wait(requiredConfirmations);

        updateTx(tx.hash, {
          phase: "confirmed",
          confirmations: receipt.confirmations,
          receipt
        });

        return receipt;
      } catch (err: any) {
        const message =
          err?.reason ||
          err?.message ||
          "Transaction failed";

        // Capture hash if available
        const hash = err?.transactionHash;

        if (hash) {
          updateTx(hash, {
            phase: "failed",
            error: message
          });
        }

        return null;
      }
    },
    [updateTx]
  );

  /* ---------------- MANUAL CONTROLS ---------------- */

  const clearTransaction = useCallback((hash: string) => {
    setTransactions((prev) => {
      const next = { ...prev };
      delete next[hash];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setTransactions({});
  }, []);

  /* ---------------- DERIVED ---------------- */

  const pendingTxs = Object.values(transactions).filter(
    (t) => t.phase === "pending"
  );

  const hasPending = pendingTxs.length > 0;

  return {
    transactions,
    pendingTxs,
    hasPending,

    trackTransaction,
    clearTransaction,
    clearAll
  };
};

export default useTransactionStatus;
