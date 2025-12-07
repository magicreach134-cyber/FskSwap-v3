import tokenColors from "../utils/tokenColors";

const TokenOption = ({ token }) => (
  <div className="token-option" style={{ color: tokenColors[token.symbol] }}>
    {token.symbol} - {token.name}
  </div>
);
