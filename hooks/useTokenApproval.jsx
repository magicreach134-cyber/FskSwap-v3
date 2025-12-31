"use client";

import { useState } from "react";
import { Contract, Signer, parseUnits, BigInt } from "ethers";

const MINIMAL_ERC20_ABI = [
  "function allowance(address owner, address spender) view returns(uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const useTokenApproval = (
  signer: Signer | null,
  tokenAddress: string,
  spenderAddress: string
) => {
  const [approved, setApproved] = useState(false);

  const checkAllowance = async (owner: string, decimals = 18): Promise<bigint> => {
    if (!signer || !tokenAddress || !spenderAddress || !owner) return 0n;
    try {
      const token = new Contract(tokenAddress, MINIMAL_ERC20_ABI, signer);
      const allowance: bigint = await token.allowance(owner, spenderAddress);
      setApproved(allowance > 0n);
      return allowance;
    } catch (err) {
      console.error("checkAllowance error:", err);
      return 0n;
    }
  };

  const approve = async (amount: string | number, decimals = 18) => {
    if (!signer || !tokenAddress || !spenderAddress) throw new Error("Missing parameters for approve");
    try {
      const token = new Contract(tokenAddress, MINIMAL_ERC20_ABI, signer);
      const tx = await token.approve(spenderAddress, parseUnits(amount.toString(), decimals));
      await tx.wait();
      setApproved(true);
      return tx;
    } catch (err) {
      console.error("approve transaction failed:", err);
      throw err;
    }
  };

  return { approved, checkAllowance, approve };
};

export default useTokenApproval;
