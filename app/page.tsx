import WalletConnectButton from '../components/WalletConnect';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-20">
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-yellow-400">Welcome to FskSwap - Powered by Fressking</h1>
        <p className="mb-6 text-lg text-gray-700 dark:text-gray-300">Rise, roar, and rule the decentralized finance world with FSK tokens.</p>
        <div className="flex space-x-4">
          <WalletConnectButton />
          <Link href="/dashboard" className="text-yellow-500 hover:underline text-lg">
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
