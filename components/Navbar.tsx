"use client";

import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* logo from public folder */}
          <img
            src="/IMG_20251012_125052.png"
            alt="FskSwap"
            className="h-10 w-auto rounded-md object-contain
                       filter brightness-100 dark:brightness-75"
            onError={(e) => {
              // keep this small inline handler to optionally hide broken image
              // @ts-ignore
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="font-semibold text-lg text-gray-900 dark:text-yellow-400">
            FskSwap
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-gray-700 dark:text-gray-200 hover:underline">
            About
          </Link>
          <Link href="/dashboard" className="text-sm text-yellow-500 hover:underline">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
