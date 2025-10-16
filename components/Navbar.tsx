"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ChevronDown, Moon, Sun } from "lucide-react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const links = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Swap", href: "/swap" },
    { name: "Chart", href: "/chart" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Admin", href: "/admin" },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md fixed w-full top-0 left-0 z-50">
      {/* Left: Logo and text */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/IMG_20251012_125052.png"
            alt="FskSwap Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </Link>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            FskSwap-v3
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Fressking
          </p>
        </div>
      </div>

      {/* Right: dropdown + dark mode */}
      <div className="flex items-center gap-3 relative">
        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Menu
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>
    </nav>
  );
}
