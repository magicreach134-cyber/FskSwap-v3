"use client";
import { useState } from 'react';
import { ethers } from 'ethers';
import { useSigner } from 'wagmi';

const PANCAKE_ROUTER = '0xD99D1c07F094a657180b141Bbdbd60aE03883f07';
const FSK_ADDRESS = '0xYourFSKAddress'; // Update with deployed address
const WBNB_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89bAE118';
const ABI = ["function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"]; // Add full ABI later

export default function Swap() {
  const [amountIn, setAmountIn] = useState('');
  const { data: signer } = useSigner();

  const handleSwap = async () => {
    if (!signer) return;
    const router = new ethers.Contract(PANCAKE_ROUTER, ABI, signer);
    const path = [WBNB_ADDRESS, FSK_ADDRESS];
    await router.swapExactETHForTokens(0, path, await signer.getAddress(), Math.floor(Date.now() / 1000) + 60 * 20, { value: ethers.parseEther(amountIn) });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Swap</h2>
      <input value={amountIn} onChange={e => setAmountIn(e.target.value)} placeholder="Amount BNB" className="p-2 border rounded" />
      <button onClick={handleSwap} className="bg-yellow-500 text-white p-2 rounded ml-2">Swap BNB to FSK</button>
    </div>
  );
}
