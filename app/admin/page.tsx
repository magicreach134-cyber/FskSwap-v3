"use client";
import { useAccount } from 'wagmi';
import Navbar from '../../components/Navbar';

const OWNER_ADDRESS = 'your_deployer_address'; // Replace with your address

export default function Admin() {
  const { address } = useAccount();
  if (address !== OWNER_ADDRESS) return <p className="container mx-auto p-6">Access Denied</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-20">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400">Admin Panel - FskSwap</h1>
        <p>Admin controls here.</p>
      </div>
    </div>
  );
}
