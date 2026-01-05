"use client";

import { ReactNode } from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

import {
  RainbowKitProvider,
  getDefaultWallets,
  darkTheme,
} from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";

/* ================= CHAIN CONFIG ================= */

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [bscTestnet],
  [publicProvider()]
);

/* ================= WALLETS ================= */

const { connectors } = getDefaultWallets({
  appName: "FSKSwap",
  projectId: "fsk-swap-testnet", // required, not deprecated
  chains,
});

/* ================= WAGMI CONFIG ================= */

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

/* ================= PROVIDER ================= */

export default function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={darkTheme({
          accentColor: "#f6c94d",
          borderRadius: "medium",
        })}
        modalSize="compact"
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
