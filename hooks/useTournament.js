import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ─── Cache Utility ────────────────────────────────────────────────────────────

const CACHE_PREFIX = "tournament_cache:";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generates a safe, deterministic cache key from an arbitrary string.
 * Prefixed to avoid collisions with other localStorage keys.
 */
function makeCacheKey(raw) {
  // Sanitize: strip characters that aren't alphanumeric, dash, underscore, or colon
  const safe = String(raw).replace(/[^a-zA-Z0-9_:=-]/g, "_");
  return `${CACHE_PREFIX}${safe}`;
}

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(makeCacheKey(key));
    if (!raw) return null;

    const { data, expiresAt } = JSON.parse(raw);

    if (Date.now() > expiresAt) {
      localStorage.removeItem(makeCacheKey(key));
      return null;
    }

    return data;
  } catch {
    // Corrupted entry — evict it silently
    try {
      localStorage.removeItem(makeCacheKey(key));
    } catch {}
    return null;
  }
}

function cacheSet(key, data, ttlMs = DEFAULT_TTL_MS) {
  try {
    const entry = JSON.stringify({ data, expiresAt: Date.now() + ttlMs });
    localStorage.setItem(makeCacheKey(key), entry);
  } catch (err) {
    // localStorage may be full (QuotaExceededError) — fail silently
    if (err?.name === "QuotaExceededError") {
      evictOldestCacheEntries();
    }
  }
}

function cacheDelete(key) {
  try {
    localStorage.removeItem(makeCacheKey(key));
  } catch {}
}

/** Remove all tournament cache entries whose keys start with the prefix. */
function cacheDeleteAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

/** Evict the oldest cache entries when storage is full. */
function evictOldestCacheEntries() {
  try {
    const entries = Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .map((k) => {
        try {
          const { expiresAt } = JSON.parse(localStorage.getItem(k));
          return { k, expiresAt };
        } catch {
          return { k, expiresAt: 0 };
        }
      })
      .sort((a, b) => a.expiresAt - b.expiresAt);

    // Remove the oldest half
    entries
      .slice(0, Math.ceil(entries.length / 2))
      .forEach(({ k }) => localStorage.removeItem(k));
  } catch {}
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

// Fetch tournaments with filters
export function useTournaments(initialFilters = {}) {
  const [tournaments, setTournaments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "REGISTRATION",
    ...initialFilters,
  });
  const fetchTournaments = useCallback(
    async ({ bustCache = false } = {}) => {
      setError(null);

      const cacheKey = `tournaments:${JSON.stringify(filters)}`;

      // ─── Step 1: Check cache first ────────────────────────────────────────
      // Every unique filter/search combination has its own cache entry.
      // If we get a hit, render immediately — no loading state, no network call.
      if (!bustCache) {
        const cached = cacheGet(cacheKey);
        if (cached) {
          setTournaments(cached.tournaments);
          setPagination(cached.pagination);
          setLoading(false); // ✅ Clear any previous loading state
          return; // ✅ Skip network entirely
        }
      }

      // ─── Step 2: Cache miss — fetch from network ──────────────────────────
      // Only show the loading spinner when we actually need to hit the API.
      setLoading(true);

      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {

            params.append(key, value.toString());
          }
        });


        const response = await fetch(`/api/tournaments?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch tournaments");
        }

        const tournaments = data.data.tournaments || [];
        const pagination = data.data.pagination || null;

        setTournaments(tournaments);
        setPagination(pagination);

        // ─── Step 3: Populate cache for this filter combination ───────────
        // Next time the same search/filter is used, Step 1 will serve it instantly.
        cacheSet(cacheKey, { tournaments, pagination });
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load tournaments", { description: err.message });
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // ✅ Search calls this → triggers fetchTournaments → cache checked first
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchTournaments({ bustCache: true });
  }, [fetchTournaments]);

  return {
    tournaments,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

// Fetch single tournament
export function useTournament(id, options = {}) {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTournament = useCallback(
    async ({ bustCache = false } = {}) => {
      if (!id) return;

      setLoading(true);
      setError(null);

      const cacheKey = `tournament:${id}:${JSON.stringify(options)}`;

      if (!bustCache) {
        const cached = cacheGet(cacheKey);
        if (cached) {
          setTournament(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const params = new URLSearchParams({
          includeParticipation: options.includeParticipation || false,
          includeMatches: options.includeMatches || false,
          includePlacements: options.includePlacements || false,
        });

        const response = await fetch(
          `/api/tournaments/${id}?${params.toString()}`,
        );
        const { data } = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch tournament");
        }
        setTournament(data);
        cacheSet(cacheKey, data);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load tournament", { description: err.message });
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      id,
      options.includeParticipation,
      options.includeMatches,
      options.includePlacements,
    ],
  );

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  const refresh = useCallback(() => {
    fetchTournament({ bustCache: true });
  }, [fetchTournament]);

  return { tournament, loading, error, refresh };
}

// Create tournament mutation
export function useCreateTournament() {
  const [creating, setCreating] = useState(false);

  const createTournament = useCallback(async (data) => {
    setCreating(true);

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create tournament");
      }

      // New tournament → invalidate all list caches
      cacheDeleteAll();

      toast.success("Tournament created successfully", {
        description: `${data.name} has been created`,
      });

      return result.data;
    } catch (err) {
      toast.error("Failed to create tournament", { description: err.message });
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  return { createTournament, creating };
}

// Update tournament mutation
export function useUpdateTournament() {
  const [updating, setUpdating] = useState(false);

  const updateTournament = useCallback(async (id, data) => {
    setUpdating(true);

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update tournament");
      }

      // Invalidate cached entries for this tournament and all list views
      cacheDeleteAll();

      toast.success("Tournament updated successfully", {
        description: `${result.data.name} has been updated`,
      });

      return result.data;
    } catch (err) {
      toast.error("Failed to update tournament", { description: err.message });
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { updateTournament, updating };
}

// Delete tournament mutation
export function useDeleteTournament() {
  const [deleting, setDeleting] = useState(false);

  const deleteTournament = useCallback(async (id, tournamentName) => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete tournament");
      }

      // Remove specific tournament cache + all list caches
      cacheDeleteAll();

      toast.success(result.message || "Tournament deleted successfully", {
        description: tournamentName,
      });

      return result.data;
    } catch (err) {
      toast.error("Failed to delete tournament", { description: err.message });
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteTournament, deleting };
}
