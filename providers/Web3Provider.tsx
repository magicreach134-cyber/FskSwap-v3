"use client";

import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, bscTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig({
  chains: [mainnet, bscTestnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [bscTestnet.id]: http(),
  },
  ssr: true, // ✅ prevents hydration issues on Next.js
});

const queryClient = new QueryClient();

export default function Web3Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
