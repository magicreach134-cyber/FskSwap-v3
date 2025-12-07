"use client";

import { useState } from "react";

const RemoveLiquidity = () => {
  const [lpAmount, setLpAmount] = useState("");

  const handleRemove = () => {
    alert(`Removing LP: ${lpAmount}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Remove Liquidity</h2>
      <input type="text" placeholder="LP Token Amount" value={lpAmount} onChange={(e) => setLpAmount(e.target.value)} className="block mb-2 p-2 border rounded" />
      <button onClick={handleRemove} className="px-4 py-2 bg-red-600 text-white rounded">Remove Liquidity</button>
    </div>
  );
};

export default RemoveLiquidity;
