// src/components/TokenSelect.jsx
"use client";

import { useState } from "react";
import styles from "../style/token-select.module.css"; // optional CSS module

const TOKEN_LIST = [
  { symbol: "BTC", color: "#F7931A" },
  { symbol: "ETH", color: "#627EEA" },
  { symbol: "SOL", color: "#66F9A1" },
  { symbol: "USDC", color: "#2775CA" },
  { symbol: "FUSDT", color: "#FF4500" }, // red gold
  { symbol: "WBNB", color: "#F3BA2F" },
  { symbol: "FSK", color: "#FFD700" }, // yellow gold
];

const TokenSelect = ({ selectedToken, onSelect }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (token) => {
    onSelect(token);
    setOpen(false);
  };

  return (
    <div className={styles.tokenSelect}>
      <button
        className={styles.selectorButton}
        onClick={() => setOpen(!open)}
      >
        {selectedToken ? selectedToken.symbol : "Select Token"}
        <span className={styles.arrow}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul className={styles.dropdown}>
          {TOKEN_LIST.map((token) => (
            <li
              key={token.symbol}
              className={styles.dropdownItem}
              onClick={() => handleSelect(token)}
            >
              <span
                className={styles.colorDot}
                style={{ backgroundColor: token.color }}
              />
              {token.symbol}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokenSelect;
