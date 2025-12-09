"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const useTokenAllowance = (signer, tokenAddress, spenderAddress) => {
  const [allowance, setAllowance] = useState("0");
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!signer || !tokenAddress || !spenderAddress) return;

    const checkAllowance = async () => {
      try {
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ["function allowance(address,address) view returns (uint256)"],
          signer
        );
        const owner = await signer.getAddress();
        const currentAllowance = await tokenContract.allowance(owner, spenderAddress);
        setAllowance(ethers.utils.formatUnits(currentAllowance, 18));
        setApproved(currentAllowance.gt(0));
      } catch (err) {
        console.error("Allowance check failed:", err);
      }
    };

    checkAllowance();
  }, [signer, tokenAddress, spenderAddress]);

  const approve = async (amount) => {
    if (!signer) return;
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function approve(address,uint256)"],
        signer
      );
      const tx = await tokenContract.approve(
        spenderAddress,
        ethers.utils.parseUnits(amount.toString(), 18)
      );
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
