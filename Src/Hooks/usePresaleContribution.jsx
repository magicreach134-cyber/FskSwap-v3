"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

const usePresaleContribution = (presaleAddress, userAddress, provider) => {
  const [contribution, setContribution] = useState(ethers.BigNumber.from(0));

  useEffect(() => {
    if (!presaleAddress || !userAddress || !provider) return;

    const fetchContribution = async () => {
      try {
        const abi = [
          "function contributions(address) view returns (uint256)"
        ];
        const presaleContract = new ethers.Contract(presaleAddress, abi, provider);
        const userContribution = await presaleContract.contributions(userAddress);
        setContribution(userContribution);
      } catch (err) {
        console.error("usePresaleContribution error:", err);
      }
    };

    fetchContribution();
  }, [presaleAddress, userAddress, provider]);

  const formattedContribution = parseFloat(ethers.utils.formatEther(contribution));

  return { contribution: formattedContribution, rawContribution: contribution };
};

export default usePresaleContribution;
