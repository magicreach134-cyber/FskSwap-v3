// providers/Web3Provider.tsx
// Replace the existing file contents with this exact code.

import React from "react";
import { createConfig, WagmiConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, bsc } from "wagmi/chains";

const queryClient = new QueryClient();

/**
 * create a wagmi config using http transports for each chain.
 * This avoids importing from wagmi/providers/public which some wagmi versions don't export.
 */
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
});

// Enable auto connect AFTER creating config
config.autoConnect = true;

export default config;

