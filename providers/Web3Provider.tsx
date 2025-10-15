"use client";
import { createWeb3Modal } from '@web3modal/wagmi';
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';

const chains = [bscTestnet];
const projectId = process.env.WALLET_CONNECT_PROJECT_ID || 'your_walletconnect_project_id';

const { publicClient } = configureChains(chains, [ /* Add providers if needed */ ]);
const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
});

createWeb3Modal({ wagmiConfig, projectId });

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}
