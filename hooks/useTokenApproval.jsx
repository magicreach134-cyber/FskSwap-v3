"use client";

import { useState } from "react";
import { ethers } from "ethers";

const useTokenApproval = (signer, tokenAddress, spenderAddress) => {
  const [approved, setApproved] = useState(false);

  const checkAllowance = async (owner, decimals = 18) => {
    if (!signer || !tokenAddress || !spenderAddress || !owner) return false;
    try {
      const token = new ethers.Contract(
        tokenAddress,
        ["function allowance(address,address) view returns(uint256)"],
        signer
      );
      const allowance = await token.allowance(owner, spenderAddress);
      setApproved(allowance.gt(0));
      return allowance;
    } catch (err) {
      console.error("checkAllowance error:", err);
      return ethers.BigNumber.from(0);
    }
  };

  const approve = async (amount, decimals = 18) => {
    if (!signer || !tokenAddress || !spenderAddress) throw new Error("Missing parameters for approve");
    try {
      const token = new ethers.Contract(
        tokenAddress,
        ["function approve(address,uint256) returns (bool)"],
        signer
      );
      const tx = await token.approve(spenderAddress, ethers.utils.parseUnits(amount.toString(), decimals));
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
