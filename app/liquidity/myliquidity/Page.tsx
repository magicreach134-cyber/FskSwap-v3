"use client";

import { useEffect, useState } from "react";

const MyLiquidity = () => {
  const [positions, setPositions] = useState<{pair: string, amount: string}[]>([]);

  useEffect(() => {
    setPositions([
      { pair: "FSK/BNB", amount: "100" },
      { pair: "USDT/FSK", amount: "50" },
    ]);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Liquidity</h2>
      <ul>
        {positions.map((pos, i) => (
          <li key={i} className="mb-2">
            {pos.pair}: {pos.amount} LP
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyLiquidity;
