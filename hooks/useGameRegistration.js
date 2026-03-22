"use client";
import { useEffect, useState, useCallback } from "react";

/**
 * useGameRegistrations
 *
 * Fetches the latest 5 registrations for a given game + total count.
 *
 * @param {string|null} gameId
 * @returns {{ registrations: object[], totalCount: number, loading: boolean, error: string|null, refetch: () => void }}
 *
 * Expected API:  GET /api/game-registrations?gameId=<id>&limit=5
 * Response:      { registrations: [...], totalCount: number }
 */
export function useGameRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    sportType: undefined,
    category: undefined,
    isActive: undefined,
    // sortBy: "date",
    // sortOrder: "asc",
    page: 1,
    limit: 1000,
  });

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.sportType) params.append("sportType", filters.sportType);
      if (filters.category) params.append("category", filters.category);
      if (filters.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());
      const res = await fetch(
        `/api/tournaments/game-registrations?${params.toString()}`,
      );

      if (!res.ok)
        throw new Error(`Request failed: ${res.status} ${res.statusText}`);

      const { data } = await res.json();
      setRegistrations(data.data ?? []);
      setTotalCount(data.data.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return {
    registrations,
    totalCount,
    loading,
    error,
    refetch: fetchRegistrations,
  };
}
