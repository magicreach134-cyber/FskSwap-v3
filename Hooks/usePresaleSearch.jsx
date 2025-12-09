import { useState, useMemo } from "react";

const usePresaleSearch = (presales, initialStatus = "all") => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const filteredPresales = useMemo(() => {
    if (!presales || presales.length === 0) return [];

    const lowerQuery = query.toLowerCase();

    return presales.filter((p) => {
      // Filter by search query
      const matchesQuery =
        p.token.toLowerCase().includes(lowerQuery) ||
        (p.name || "").toLowerCase().includes(lowerQuery) ||
        (p.symbol || "").toLowerCase().includes(lowerQuery);

      // Filter by status
      const matchesStatus =
        statusFilter === "all" ? true : p.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, presales]);

  return { query, setQuery, filteredPresales, statusFilter, setStatusFilter };
};

export default usePresaleSearch;
