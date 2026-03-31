// hooks/useFamily.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ─── Cache Utility ────────────────────────────────────────────────────────────

const CACHE_PREFIX = "family_cache:";
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

/** Remove all family cache entries whose keys start with the prefix. */
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

/**
 * Hook to fetch families with pagination, search, and filters
 */
export function useFamilies(initialFilters = {}) {
  const [families, setFamilies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 1000,
    sortBy: "familyName",
    sortOrder: "asc",
    ...initialFilters,
  });

  const fetchFamilies = useCallback(
    async ({ bustCache = false } = {}) => {
      setError(null);

      const cacheKey = `families:${JSON.stringify(filters)}`;

      // ─── Step 1: Check cache first ────────────────────────────────────────
      // Every unique filter/search combination has its own cache entry.
      // If we get a hit, render immediately — no loading state, no network call.
      if (!bustCache) {
        const cached = cacheGet(cacheKey);
        if (cached) {
          setFamilies(cached.families);
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

        const response = await fetch(`/api/families?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch families");
        }

        const families = data.data.data || [];
        const pagination = data.pagination || null;

        setFamilies(families);
        setPagination(pagination);

        // ─── Step 3: Populate cache for this filter combination ───────────
        // Next time the same search/filter is used, Step 1 will serve it instantly.
        cacheSet(cacheKey, { families, pagination });
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load families", { description: err.message });
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  // ✅ Search calls this → triggers fetchFamilies → cache checked first
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchFamilies({ bustCache: true });
  }, [fetchFamilies]);
  return {
    families,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

/**
 * Hook to fetch a single family by ID
 */
export function useFamily(id, options = {}) {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFamily = useCallback(
    async ({ bustCache = false } = {}) => {
      if (!id) return;

      setLoading(true);
      setError(null);

      const cacheKey = `family:${id}:${JSON.stringify(options)}`;

      if (!bustCache) {
        const cached = cacheGet(cacheKey);
        if (cached) {
          setFamily(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const response = await fetch(`/api/families/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch family");
        }

        setFamily(data.data);
        cacheSet(cacheKey, data);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load family details", {
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    },
    [id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const refresh = useCallback(() => {
    fetchFamily({ bustCache: true });
  }, [fetchFamily]);

  return { family, loading, error, refresh };
}

/**
 * Hook to create a new family
 */
export function useCreateFamily() {
  const [creating, setCreating] = useState(false);

  const createFamily = useCallback(async (data) => {
    setCreating(true);

    try {
      const response = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to create family",
        );
      }

      // New family → invalidate all list caches
      cacheDeleteAll();

      toast.success("Family created successfully", {
        description: `${data.familyName} has been created`,
      });

      return result;
    } catch (err) {
      toast.error("Failed to create family", { description: err.message });
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  return { createFamily, creating };
}

/**
 * Hook to update an existing family
 */
export function useUpdateFamily() {
  const [updating, setUpdating] = useState(false);

  const updateFamily = useCallback(async (id, data) => {
    setUpdating(true);

    try {
      const response = await fetch(`/api/families/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to update family",
        );
      }

      // Invalidate cached entries for this family and all list views
      cacheDeleteAll();

      toast.success("Family updated successfully", {
        description: `${result.data?.familyName || data.familyName} has been updated`,
      });

      return result;
    } catch (err) {
      toast.error("Failed to update family", { description: err.message });
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { updateFamily, updating };
}

/**
 * Hook to delete a family
 */
export function useDeleteFamily() {
  const [deleting, setDeleting] = useState(false);

  const deleteFamily = useCallback(async (id, name) => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/families/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to delete family",
        );
      }

      // Remove specific family cache + all list caches
      cacheDeleteAll();

      toast.success(result.message || "Family deleted successfully", {
        description: name,
      });

      return result;
    } catch (err) {
      toast.error("Failed to delete family", { description: err.message });
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteFamily, deleting };
}
