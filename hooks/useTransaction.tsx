// hooks/useTransaction.ts
"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";

export interface TransactionStatus {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  receipt?: ethers.providers.TransactionReceipt;
  error?: string;
}

interface UseTransaction {
  transactions: TransactionStatus[];
  sendTransaction: (
    txCallback: () => Promise<ethers.providers.TransactionResponse>
  ) => Promise<void>;
}

/**
 * useTransaction Hook
 * Handles sending transactions and tracking their status
 */
const useTransaction = (): UseTransaction => {
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);

  const sendTransaction = useCallback(
    async (txCallback: () => Promise<ethers.providers.TransactionResponse>) => {
      try {
        const txResponse = await txCallback();
        const txStatus: TransactionStatus = { hash: txResponse.hash, status: "pending" };
        setTransactions((prev) => [...prev, txStatus]);

        const receipt = await txResponse.wait();

        setTransactions((prev) =>
          prev.map((tx) =>
            tx.hash === txResponse.hash
              ? { ...tx, status: receipt.status === 1 ? "confirmed" : "failed", receipt }
              : tx
          )
        );
      } catch (err: any) {
        console.error("Transaction failed", err);
        setTransactions((prev) => [
          ...prev,
          { hash: "", status: "failed", error: err?.message || "Unknown error" },
        ]);
      }
    },
    []
  );

  return { transactions, sendTransaction };
};

export default useTransaction;
