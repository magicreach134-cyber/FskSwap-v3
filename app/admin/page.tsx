import { useAccount } from 'wagmi';

// Your BNB Testnet address
const OWNER_ADDRESS = '0x21bA9D747BcbAF3cA3efdba3f6B2c059b6C2E02c' as const;

export default function Admin() {
  const { address } = useAccount();

  if (address !== OWNER_ADDRESS) return <p className="container mx-auto p-6">Access Denied</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-20">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400 container mx-auto p-6">Admin Panel</h1>
      <p className="container mx-auto p-6">Welcome to the admin dashboard. Add your admin features here.</p>
    </div>
  );
}
