"use client";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 text-white p-4 fixed w-full top-0 z-10 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex flex-col items-start space-y-2">
          <Link href="/">
            <Image src="/logo.png" alt="FskSwap - Powered by Fressking Logo" width={60} height={60} className="object-contain transition-transform hover:scale-105" priority />
          </Link>
          <span className="text-lg font-bold tracking-tight text-yellow-400">FskSwap - Powered by Fressking</span>
        </div>
        <ul className="hidden md:flex space-x-6 items-center">
          <li><Link href="/" className="hover:text-yellow-400 transition">Home</Link></li>
          <li><Link href="/dashboard" className="hover:text-yellow-400 transition">Dashboard</Link></li>
          <li><Link href="/swap" className="hover:text-yellow-400 transition">Swap</Link></li>
          <li><Link href="/chart" className="hover:text-yellow-400 transition">Chart</Link></li>
          <li><Link href="/about" className="hover:text-yellow-400 transition">About</Link></li>
          <li><Link href="/contact" className="hover:text-yellow-400 transition">Contact</Link></li>
          <li><Link href="/admin" className="hover:text-yellow-400 transition">Admin</Link></li>
          <li><ThemeToggle /></li>
        </ul>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {isOpen && (
        <ul className="md:hidden flex flex-col space-y-2 mt-4 bg-gray-700 p-4 rounded-lg shadow-md">
          <li><Link href="/" className="block py-2 hover:text-yellow-400">Home</Link></li>
          <li><Link href="/dashboard" className="block py-2 hover:text-yellow-400">Dashboard</Link></li>
          <li><Link href="/swap" className="block py-2 hover:text-yellow-400">Swap</Link></li>
          <li><Link href="/chart" className="block py-2 hover:text-yellow-400">Chart</Link></li>
          <li><Link href="/about" className="block py-2 hover:text-yellow-400">About</Link></li>
          <li><Link href="/contact" className="block py-2 hover:text-yellow-400">Contact</Link></li>
          <li><Link href="/admin" className="block py-2 hover:text-yellow-400">Admin</Link></li>
          <li><ThemeToggle /></li>
        </ul>
      )}
    </motion.nav>
  );
}
