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
const config = createConfig({
  autoConnect: true,
  // "transports" is a simple approach; it provides basic http client functionality.
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
  },
});

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}
