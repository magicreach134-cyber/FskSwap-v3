"use client";

import { useState } from "react";

const AddLiquidity = () => {
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const handleAdd = () => {
    alert(`Adding LP: TokenA ${amountA}, TokenB ${amountB}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add Liquidity</h2>
      <input type="text" placeholder="Token A Amount" value={amountA} onChange={(e) => setAmountA(e.target.value)} className="block mb-2 p-2 border rounded" />
      <input type="text" placeholder="Token B Amount" value={amountB} onChange={(e) => setAmountB(e.target.value)} className="block mb-2 p-2 border rounded" />
      <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded">Add Liquidity</button>
    </div>
  );
};

export default AddLiquidity;
