import type { Metadata } from "next";

import "../styles/theme.css";
import "../styles/swap-form.css";
import "../styles/launchpad.css";
import "../styles/flashswap.css";
import "../styles/staking.css";

import DexHeader from "../components/layout/DexHeader";
import Web3Providers from "../components/providers/Web3Providers";

export const metadata: Metadata = {
  title: "FSKSwap",
  description: "FSKSwap Dex - Swap, Launchpad, FlashSwap, and Staking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Web3Providers>
          <DexHeader />
          <main className="dex-main">{children}</main>
          <footer className="dex-footer">
            <p>© {new Date().getFullYear()} FSKSwap. All rights reserved.</p>
          </footer>
        </Web3Providers>
      </body>
    </html>
  );
}
