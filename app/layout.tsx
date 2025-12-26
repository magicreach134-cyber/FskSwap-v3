
import type { Metadata } from "next";
import "../styles/theme.css";
import "../styles/swap-form.css";
import "../styles/launchpad.css";
import "../styles/flashswap.css";
import "../styles/staking.css";

import DexHeader from "../components/layout/DexHeader";
import { ThemeProvider } from "../context/ThemeContext";
import { WalletProvider } from "../context/WalletContext";

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
        <ThemeProvider>
          <WalletProvider>
            <DexHeader />
            <main className="dex-main">{children}</main>
            <footer className="dex-footer">
              <p>© {new Date().getFullYear()} FSKSwap. All rights reserved.</p>
            </footer>
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
