"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";

/* ======================================================
   TYPES
   ====================================================== */

export type TxStatus =
  | "idle"
  | "signing"
  | "pending"
  | "success"
  | "failed";

export interface TrackedTx {
  hash: string;
  status: TxStatus;
  confirmations: number;
  receipt?: ethers.providers.TransactionReceipt;
  error?: string;
}

interface TrackOptions {
  confirmations?: number; // default: 1
  onPending?: (hash: string) => void;
  onSuccess?: (receipt: ethers.providers.TransactionReceipt) => void;
  onError?: (error: string) => void;
}

/* ======================================================
   useTransactionTracker
   ====================================================== */

const useTransactionTracker = (
  provider?: ethers.providers.Web3Provider | null
) => {
  const [tx, setTx] = useState<TrackedTx | null>(null);
  const providerRef = useRef(provider);

  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  /* ---------------- RESET ---------------- */
  const reset = useCallback(() => {
    setTx(null);
  }, []);

  /* ---------------- TRACK ---------------- */
  const trackTransaction = useCallback(
    async (
      txPromise: Promise<ethers.providers.TransactionResponse>,
      options?: TrackOptions
    ) => {
      if (!providerRef.current) {
        throw new Error("Provider not available");
      }

      const confirmations = options?.confirmations ?? 1;

      try {
        setTx({
          hash: "",
          status: "signing",
          confirmations: 0
        });

        const response = await txPromise;

        setTx({
          hash: response.hash,
          status: "pending",
          confirmations: 0
        });

        options?.onPending?.(response.hash);

        const receipt = await response.wait(confirmations);

        setTx({
          hash: response.hash,
          status: "success",
          confirmations: receipt.confirmations,
          receipt
        });

        options?.onSuccess?.(receipt);

        return receipt;
      } catch (err: any) {
        const message = extractTxError(err);

        setTx((prev) => ({
          hash: prev?.hash || "",
          status: "failed",
          confirmations: prev?.confirmations || 0,
          error: message
        }));

        options?.onError?.(message);
        throw err;
      }
    },
    []
  );

  return {
    tx,
    status: tx?.status ?? "idle",
    isIdle: tx === null,
    isSigning: tx?.status === "signing",
    isPending: tx?.status === "pending",
    isSuccess: tx?.status === "success",
    isFailed: tx?.status === "failed",

    trackTransaction,
    reset
  };
};

/* ======================================================
   ERROR DECODER
   ====================================================== */

function extractTxError(error: any): string {
  if (!error) return "Transaction failed";

  if (typeof error === "string") return error;

  if (error?.reason) return error.reason;

  if (error?.error?.message) return error.error.message;

  if (error?.data?.message) return error.data.message;

  if (error?.message) return error.message;

  return "Transaction reverted";
}

export default useTransactionTracker;
