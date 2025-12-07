import { useState, useMemo } from "react";

/**
 * Hook to filter presales based on search query and status.
 * @param {Array} presales - Array of presale objects
 * @param {string} initialStatus - "all" | "active" | "upcoming" | "ended"
 */
const usePresaleSearch = (presales, initialStatus = "all") => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const filteredPresales = useMemo(() => {
    return presales.filter((p) => {
      // Filter by status
      const statusMatch =
        statusFilter === "all" ? true : p.status === statusFilter;

      if (!statusMatch) return false;

      // Filter by search query
      if (!query) return true;
      const lowerQuery = query.toLowerCase();
      const tokenAddr = (p.token || "").toLowerCase();
      const tokenName = (p.name || "").toLowerCase();
      const tokenSymbol = (p.symbol || "").toLowerCase();

      return (
        tokenAddr.includes(lowerQuery) ||
        tokenName.includes(lowerQuery) ||
        tokenSymbol.includes(lowerQuery)
      );
    });
  }, [query, statusFilter, presales]);

  return { query, setQuery, filteredPresales, statusFilter, setStatusFilter };
};

export default usePresaleSearch;
