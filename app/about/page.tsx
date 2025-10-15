import Navbar from '../../components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-20">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400 mb-6">About Fressking (FSK)</h1>

        <section className="mb-6">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            At Fressking (FSK), we’re building more than a DeFi ecosystem — we’re laying the foundation for a complete financial and technological evolution that scales beyond decentralized finance into Centralized Exchange (CEX) and Blockchain infrastructure.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
            Our vision is simple: to make finance truly borderless, transparent, and rewarding for everyone — from early crypto adopters to global investors.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
            Fressking isn’t driven by hype, but by purpose. Every token, every feature, and every roadmap milestone is designed to create real value and utility across the DeFi–CEX–Blockchain spectrum.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-yellow-400 mb-4">Tokenomics</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Presale (Public & Seed Sale):</strong> 55%</li>
            <li><strong>Liquidity Pool (LP):</strong> 15% (70% burned, 30% locked for 24 months)</li>
            <li><strong>Ecosystem Development:</strong> 20%</li>
            <li><strong>Team:</strong> 5% (Vested for 24 months with 12-month cliff and 3-month linear distribution)</li>
            <li><strong>Community Airdrop:</strong> 5%</li>
            <li><strong>Tax:</strong> 0% (Zero Tax Policy)</li>
            <li><strong>Dev Allocation:</strong> None</li>
            <li><strong>Contract:</strong> Revoked for full transparency
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-yellow-400 mb-4">Roadmap</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Phase 1 (0–3 Months):</strong> Token generation, smart contract development, audit, website & DApp Testnet, seed sale, public sale via Pinksale or CEX pad, and TGE launch.</li>
            <li><strong>Phase 2 (3–6 Months):</strong> Scalable DApp goes live.</li>
            <li><strong>Phase 3 (6–12 Months):</strong> Full Hybrid DApp launches.</li>
            <li><strong>Phase 4 (12–16 Months):</strong> CEX Testnet development.</li>
            <li><strong>Phase 5 (16–24 Months):</strong> CEX mainnet goes live.</li>
            <li><strong>Phase 6 (24–28 Months):</strong> Blockchain Testnet development.</li>
            <li><strong>Phase 7 (28–32 Months):</strong> Fressking Blockchain mainnet launch.</li>
          </ol>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
            At its core, Fressking stands for freedom, scalability, and transparency — a brand built by the people, for the people.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-yellow-400 mb-4">🟡 FRESSKING (FSK) LITEPAPER</h2>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-yellow-400 mt-4 mb-2">1. Introduction</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Fressking (FSK) is a next-generation ecosystem bridging DeFi, CEX, and blockchain layers. Our mission is to unify decentralized and centralized finance under one scalable, transparent, and community-driven framework.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-yellow-400 mt-4 mb-2">2. Vision</h3>
          <p className="text-gray-700 dark:text-gray-300">
            To build an all-in-one financial system where users can trade, earn, stake, and launch tokens seamlessly — from DeFi to CEX to a native blockchain.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-yellow-400 mt-4 mb-2">3. Tokenomics</h3>
          <table className="w-full text-left border-collapse mb-4">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border p-2">Allocation</th>
                <th className="border p-2">Percentage</th>
                <th className="border p-2">Vesting/Lock Details</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border">
                <td className="border p-2">Presale (Public + Seed)</td>
                <td className="border p-2">55%</td>
                <td className="border p-2">-</td>
              </tr>
              <tr className="border">
                <td className="border p-2">Liquidity Pool</td>
                <td className="border p-2">15%</td>
                <td className="border p-2">70% open, 30% locked for 24 months</td>
              </tr>
              <tr className="border">
                <td className="border p-2">Ecosystem Development</td>
                <td className="border p-2">20%</td>
                <td className="border p-2">-</td>
              </tr>
              <tr className="border">
                <td className="border p-2">Team</td>
                <td className="border p-2">5%</td>
                <td className="border p-2">24 months vesting, 12-month cliff, 3-month linear release</td>
              </tr>
              <tr className="border">
                <td className="border p-2">Community Airdrop</td>
                <td className="border p-2">5%</td>
                <td className="border p-2">-</td>
              </tr>
              <tr className="border">
                <td className="border p-2">Dev Allocation</td>
                <td className="border p-2">0%</td>
                <td className="border p-2">-</td>
              </tr>
              <tr className="border">
                <td className="border p-2">Tax</td>
                <td className="border p-2">0%</td>
                <td className="border p-2">-</td>
              </tr>
            </tbody>
          </table>
          <p className="text-gray-700 dark:text-gray-300">Contract Revoked – 100% Transparent Ownership.</p>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-yellow-400 mt-4 mb-2">4. Roadmap Summary</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Token launch, website, audit, and Testnet DApp</li>
            <li>DApp scaling and full hybrid upgrade</li>
            <li>CEX Testnet and mainnet rollout</li>
            <li>Blockchain Testnet and full mainnet launch</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-yellow-400 mt-4 mb-2">5. Core Values</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Transparency & zero-tax operations</li>
            <li>Community-first governance</li>
            <li>Real product delivery — not just promises</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 dark:text-yellow-400 mt-4 mb-2">6. Conclusion</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Fressking (FSK) aims to redefine how decentralized ecosystems evolve — merging the accessibility of CEX with the technology.
          </p>
        </section>
      </div>
    </div>
  );
}
