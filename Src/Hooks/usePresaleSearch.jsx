import { useState, useMemo } from "react";

/**
 * Hook to filter presales based on search query.
 * @param {Array} presales - Array of presale objects
 */
const usePresaleSearch = (presales) => {
  const [query, setQuery] = useState("");

  const filteredPresales = useMemo(() => {
    if (!query) return presales;

    const lowerQuery = query.toLowerCase();

    return presales.filter((p) => {
      const tokenAddr = (p.token || "").toLowerCase();
      const tokenName = (p.name || "").toLowerCase();
      const tokenSymbol = (p.symbol || "").toLowerCase();

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
