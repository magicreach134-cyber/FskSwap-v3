"use client";
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

const FSK_CONTRACT = '0xYourFSKAddress'; // Update with deployed address
const ABI = ["function balanceOf(address) view returns (uint256)"]; // Add full ERC20 ABI later

export default function TokenList() {
  const { address } = useAccount();
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (address) {
      const provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');
      const fskContract = new ethers.Contract(FSK_CONTRACT, ABI, provider);
      fskContract.balanceOf(address).then(balance => {
        setTokens([{ name: 'FSK', balance: ethers.formatEther(balance) }]);
      });
    }
  }, [address]);

  return (
    <div>
      <h2 className="text-xl font-semibold">Tokens</h2>
      <ul>{tokens.map(t => <li key={t.name}>{t.name}: {t.balance} FSK</li>)}</ul>
    </div>
  );
}
