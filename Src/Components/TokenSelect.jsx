import { useState } from "react";
import "../style/token-select.css";

const AVAILABLE_TOKENS = [
  { symbol: "FSK", address: "0x784f97B0c8116727F8B6417b86975F77411e219B", decimals: 18 },
  { symbol: "FUSDT", address: "0x02F1303f087C6D78F4142bc2dE8430348982d549", decimals: 18 },
  { symbol: "BTC", address: "0xd397b48d6faf5311c166aed21313f48e2a574525", decimals: 8 },
  { symbol: "ETH", address: "0x122cca6190b40de4fd3ee28a97c995d8c6524921", decimals: 18 },
  { symbol: "SOL", address: "0x39c833e1f576d372e221e31ce82dd52b520e970c", decimals: 18 },
  { symbol: "USDC", address: "0x1c5206eeb5df5127204495969955000d15d1c0be", decimals: 18 },
  { symbol: "WBNB", address: "0xae13d989dac2f0debff460ac112a837c89baa7cd", decimals: 18 },
];

const TokenSelect = ({ selectedToken, setToken }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="token-select-container">
      <button className="token-select-btn" onClick={() => setOpen(!open)}>
        {selectedToken.symbol}
      </button>
      {open && (
        <ul className="token-select-dropdown">
          {AVAILABLE_TOKENS.map((token, idx) => (
            <li key={idx} onClick={() => { setToken(token); setOpen(false); }}>
              {token.symbol}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokenSelect;
