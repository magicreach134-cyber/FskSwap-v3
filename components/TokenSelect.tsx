// components/TokenSelect.tsx
"use client";

import { useState } from "react";
import { TOKEN_LIST } from "../utils/constants";

interface Token {
  symbol: string;
  color?: string;
  logo?: string; // optional logo URL
}

interface TokenSelectProps {
  selectedToken: Token;
  onSelect: (token: Token) => void;
}

const TokenSelect: React.FC<TokenSelectProps> = ({ selectedToken, onSelect }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (token: Token) => {
    onSelect(token);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        <div className="flex items-center space-x-2">
          {selectedToken.logo && (
            <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />
          )}
          <span>{selectedToken.symbol}</span>
        </div>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          {TOKEN_LIST.map((token) => (
            <li
              key={token.symbol}
              onClick={() => handleSelect(token)}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-yellow-500 hover:text-black cursor-pointer"
            >
              {token.logo ? (
                <img src={token.logo} alt={token.symbol} className="w-5 h-5 rounded-full" />
              ) : (
                <span
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: token.color || "#fff" }}
                />
              )}
              <span>{token.symbol}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokenSelect;
