"use client";

import { useState } from "react";

const CreateLocker = () => {
  const [lpAmount, setLpAmount] = useState("");
  const [lockTime, setLockTime] = useState("");

  const handleLock = () => {
    alert(`Locking ${lpAmount} LP for ${lockTime} days`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create LP Lock</h2>
      <input type="text" placeholder="LP Amount" value={lpAmount} onChange={(e) => setLpAmount(e.target.value)} className="block mb-2 p-2 border rounded"/>
      <input type="text" placeholder="Lock Duration (days)" value={lockTime} onChange={(e) => setLockTime(e.target.value)} className="block mb-2 p-2 border rounded"/>
      <button onClick={handleLock} className="px-4 py-2 bg-purple-600 text-white rounded">Lock LP</button>
    </div>
  );
};

export default CreateLocker;
