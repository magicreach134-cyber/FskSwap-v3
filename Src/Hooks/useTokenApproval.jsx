import { ethers } from "ethers";
import { useState } from "react";

export const useTokenApproval = (signer, tokenAddress, spenderAddress) => {
  const [approved, setApproved] = useState(false);

  const checkAllowance = async (owner) => {
    const token = new ethers.Contract(tokenAddress, ["function allowance(address,address) view returns(uint256)"], signer);
    const allowance = await token.allowance(owner, spenderAddress);
    setApproved(allowance.gt(0));
  };

  const approve = async (amount) => {
    const token = new ethers.Contract(tokenAddress, ["function approve(address,uint256)"], signer);
    const tx = await token.approve(spenderAddress, ethers.utils.parseUnits(amount.toString(), 18));
    await tx.wait();
    setApproved(true);
  };

  return { approved, checkAllowance, approve };
};
