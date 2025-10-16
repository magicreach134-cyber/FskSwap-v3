"use client";

export const dynamic = "force-dynamic";

import { useAccount } from "wagmi";
import React from "react";

export default function AdminPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      {isConnected ? (
        <p>Connected as {address}</p>
      ) : (
        <p>Please connect your wallet to view admin panel.</p>
      )}
    </div>
  );
}
