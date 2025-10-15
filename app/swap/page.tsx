import Navbar from '../../components/Navbar';
import Swap from '../../components/Swap';

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-20">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-yellow-400">Swap - FskSwap</h1>
        <Swap />
      </div>
    </div>
  );
}
