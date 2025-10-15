"use client";
import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useBalance } from 'wagmi';

export default function WalletConnectButton() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  if (isConnected) {
    return (
      <div>
        Connected: {address?.slice(0, 6)}... | Balance: {balance?.formatted} BNB
        <button onClick={() => open({ view: 'Account' })} className="ml-2 text-red-500">Disconnect</button>
      </div>
    );
  }
  return <button onClick={() => open()} className="bg-yellow-500 text-white p-2 rounded">Connect Wallet</button>;
}
