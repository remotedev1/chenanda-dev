import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const CACHE_KEY = "sponsors_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in ms

function getCacheKey(params) {
  return `${CACHE_KEY}_${params.toString()}`;
}

function getFromCache(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Quota exceeded or other storage error — fail silently
  }
}

export function useSponsors(initialFilters = {}) {
  const [sponsors, setSponsors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: true,
    ...initialFilters,
  });

  const fetchSponsors = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.append("page", pagination.page.toString());
        params.append("limit", pagination.limit.toString());
        if (filters.search) params.append("search", filters.search);
        if (filters.status) params.append("status", filters.status);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

        const cacheKey = getCacheKey(params);

        // Return cached data if available and not forcing refresh
        if (!forceRefresh) {
          const cached = getFromCache(cacheKey);
          if (cached) {
            setSponsors(cached.data);
            setPagination((prev) => ({
              ...prev,
              total: cached.total,
              totalPages: cached.totalPages,
            }));
            return;
          }
        }

        const response = await fetch(`/api/tournaments/sponsors?${params}`);
        const { data } = await response.json();

        // Save to cache
        setToCache(cacheKey, data);

        setSponsors(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }));
      } catch (error) {
        toast.error("Failed to fetch sponsors");
        console.error("Fetch sponsors error:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, filters],
  );

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  // Force refresh bypasses cache
  const refresh = useCallback(() => {
    fetchSponsors(true);
  }, [fetchSponsors]);

  return {
    sponsors,
    pagination,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

export function useCreateSponsor() {
  const [creating, setCreating] = useState(false);

  const createSponsor = async (data) => {
    setCreating(true);
    try {
      const response = await fetch("/api/tournaments/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create sponsor");
      }

      toast.success("Sponsor created successfully");
      return result.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return { createSponsor, creating };
}

export function useUpdateSponsor() {
  const [updating, setUpdating] = useState(false);

  const updateSponsor = async (id, data) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/tournaments/sponsors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update sponsor");
      }

      toast.success("Sponsor updated successfully");
      return result.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updateSponsor, updating };
}

export function useDeleteSponsor() {
  const [deleting, setDeleting] = useState(false);

  const deleteSponsor = async (id, name) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/tournaments/sponsors/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete sponsor");
      }

      toast.success("Sponsor deleted successfully");
      return true;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteSponsor, deleting };
}
