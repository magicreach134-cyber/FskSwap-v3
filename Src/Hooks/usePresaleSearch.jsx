// src/hooks/usePresaleSearch.jsx
import { useState, useMemo } from "react";

const usePresaleSearch = (presales) => {
  const [query, setQuery] = useState("");

  const filteredPresales = useMemo(() => {
    if (!query) return presales;

    const lowerQuery = query.toLowerCase();
    return presales.filter((p) => {
      const tokenAddr = p.token.toLowerCase();
      const tokenName = (p.tokenName || "").toLowerCase();
      const tokenSymbol = (p.tokenSymbol || "").toLowerCase();
      return (
        tokenAddr.includes(lowerQuery) ||
        tokenName.includes(lowerQuery) ||
        tokenSymbol.includes(lowerQuery)
      );
    });
  }, [query, presales]);

  return { query, setQuery, filteredPresales };
};

export default usePresaleSearch;
