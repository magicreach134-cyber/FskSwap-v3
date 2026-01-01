import { http, createConfig } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: 'FskSwap Testnet',
    projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
    chains: [bscTestnet],
    transports: {
      [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
    },
    ssr: true,
  })
)
