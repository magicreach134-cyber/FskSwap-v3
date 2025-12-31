"use client";

import { useState, useEffect } from "react";
import { Contract, Signer, BrowserProvider, parseUnits, formatUnits } from "ethers";

const MINIMAL_ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export const useTokenAllowance = (
  signerOrProvider: Signer | BrowserProvider | null,
  tokenAddress: string,
  spenderAddress: string
) => {
  const [allowance, setAllowance] = useState("0");
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!signerOrProvider || !tokenAddress || !spenderAddress) return;

    const checkAllowance = async () => {
      try {
        const tokenContract = new Contract(tokenAddress, MINIMAL_ERC20_ABI, signerOrProvider);
        const owner = "getAddress" in signerOrProvider ? await signerOrProvider.getAddress() : "";
        const currentAllowance: bigint = await tokenContract.allowance(owner, spenderAddress);
        setAllowance(formatUnits(currentAllowance, 18));
        setApproved(currentAllowance > 0n);
      } catch (err) {
        console.error("Allowance check failed:", err);
      }
    };

    checkAllowance();
  }, [signerOrProvider, tokenAddress, spenderAddress]);

  const approve = async (amount: string | number) => {
    if (!signerOrProvider) throw new Error("Wallet not connected");
    try {
      const tokenContract = new Contract(tokenAddress, MINIMAL_ERC20_ABI, signerOrProvider);
      const tx = await tokenContract.approve(spenderAddress, parseUnits(amount.toString(), 18));
      await tx.wait();
      setAllowance(amount.toString());
      setApproved(true);
    } catch (err) {
      console.error("Approval failed:", err);
      throw err;
    }
  };

  return { allowance, approved, approve };
};
