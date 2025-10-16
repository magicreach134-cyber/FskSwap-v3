import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public'; // Corrected path

const { chains, publicClient } = configureChains([bscTestnet], [publicProvider()]);
const config = createConfig({ publicClient });

export function Web3Provider({ children }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
