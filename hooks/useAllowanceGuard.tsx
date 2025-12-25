"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ERC20ABI } from "../utils/constants";

/* ======================================================
   TYPES
   ====================================================== */

interface AllowanceState {
  allowance: ethers.BigNumber;
  formatted: string;
  approved: boolean;
}

interface AllowanceOptions {
  spender: string;
  owner?: string;
  amount?: ethers.BigNumberish;
  autoRefresh?: boolean;
}

/* ======================================================
   useAllowanceGuard
   ====================================================== */

const useAllowanceGuard = (
  provider: ethers.providers.Web3Provider | null,
  tokenAddress: string | null,
  options: AllowanceOptions
) => {
  const [state, setState] = useState<AllowanceState | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ----------------------------------------------------
     Fetch allowance
     ---------------------------------------------------- */
  const fetchAllowance = useCallback(async () => {
    if (!provider || !tokenAddress || !options.spender) return;

    try {
      setLoading(true);
      setError(null);

      const signer = provider.getSigner();
      const owner =
        options.owner || (await signer.getAddress());

      const token = new ethers.Contract(
        tokenAddress,
        ERC20ABI,
        provider
      );

      const decimals: number = await token.decimals();
      const allowance: ethers.BigNumber =
        await token.allowance(owner, options.spender);

      const required = options.amount
        ? ethers.BigNumber.from(options.amount)
        : ethers.constants.Zero;

      setState({
        allowance,
        formatted: ethers.utils.formatUnits(allowance, decimals),
        approved: allowance.gte(required)
      });
    } catch (e: any) {
      setError(e?.reason || e?.message || "Allowance fetch failed");
    } finally {
      setLoading(false);
    }
  }, [provider, tokenAddress, options.spender, options.owner, options.amount]);

  /* ----------------------------------------------------
     Approve spender
     ---------------------------------------------------- */
  const approve = useCallback(
    async (max?: boolean) => {
      if (!provider || !tokenAddress || !options.spender)
        throw new Error("Approval prerequisites missing");

      try {
        setApproving(true);
        setError(null);

        const signer = provider.getSigner();

        const token = new ethers.Contract(
          tokenAddress,
          ERC20ABI,
          signer
        );

        const amount = max
          ? ethers.constants.MaxUint256
          : options.amount || ethers.constants.MaxUint256;

        const tx = await token.approve(
          options.spender,
          amount
        );

        await tx.wait();

        await fetchAllowance();
      } catch (e: any) {
        setError(e?.reason || e?.message || "Approval failed");
        throw e;
      } finally {
        setApproving(false);
      }
    },
    [provider, tokenAddress, options.spender, options.amount, fetchAllowance]
  );

  /* ----------------------------------------------------
     Auto refresh
     ---------------------------------------------------- */
  useEffect(() => {
    fetchAllowance();

    if (!options.autoRefresh) return;

    const i = setInterval(fetchAllowance, 12_000);
    return () => clearInterval(i);
  }, [fetchAllowance, options.autoRefresh]);

  return {
    allowance: state,
    loading,
    approving,
    error,
    refresh: fetchAllowance,
    approve
  };
};

export default useAllowanceGuard;
