import { useState, useEffect } from "react";
import { ethers } from "ethers";

const useTokenBalance = (tokenAddress, account, provider, decimals = 18) => {
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (!provider || !account || !tokenAddress) return;

    const fetchBalance = async () => {
      const abi = ["function balanceOf(address) view returns (uint256)"];
      const contract = new ethers.Contract(tokenAddress, abi, provider);
      const bal = await contract.balanceOf(account);
      setBalance(ethers.utils.formatUnits(bal, decimals));
    };

    fetchBalance();
  }, [tokenAddress, account, provider, decimals]);

  return balance;
};

export default useTokenBalance;
