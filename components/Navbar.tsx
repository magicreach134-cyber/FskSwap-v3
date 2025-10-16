"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
          <Image
            src="/IMG_20251012_125052.png"
            alt="FskSwap Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-yellow-400">
              FskSwap-v3
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Fressking
            </p>
          </div>
        </Link>

        {/* Menu Toggle Button */}
        <button
          onClick={toggleMenu}
          className="text-gray-800 dark:text-yellow-400 focus:outline-none"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="flex flex-col bg-white dark:bg-gray-900 text-center shadow-md border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/"
            onClick={closeMenu}
            className="py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            onClick={closeMenu}
            className="py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Dashboard
          </Link>
          <Link
            href="/swap"
            onClick={closeMenu}
            className="py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Swap
          </Link>
          <Link
            href="/chart"
            onClick={closeMenu}
            className="py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Chart
          </Link>
          <Link
            href="/about"
            onClick={closeMenu}
            className="py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={closeMenu}
            className="py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Contact
          </Link>
          <Link
            href="/admin"
            onClick={closeMenu}
            className="py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
