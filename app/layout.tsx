import type { Metadata } from "next";

import "../style/global.css";
import "../style/theme.css";
import "../style/tailwind.css";

import "../style/form.css";
import "../style/flashswap.css";
import "../style/launchpad.css";
import "../style/locker.css";
import "../style/staking.css";

export const metadata: Metadata = {
  title: "FSKSwap",
  description: "FSKSwap DEX — Swap, Farm, Launchpad, FlashSwap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
