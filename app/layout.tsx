import "../style/theme.css";
import "../style/swap-form.css";
import "../style/launchpad.css";
import "../style/flashswap.css";
import "../style/staking.css";
import DexHeader from "../components/layout/DexHeader";

export const metadata = {
  title: "FSKSwap",
  description: "FSKSwap Dex - Swap, Launchpad, FlashSwap, and Staking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DexHeader />

        <main className="dex-main">{children}</main>

        <footer className="dex-footer">
          <p>© {new Date().getFullYear()} FSKSwap. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
