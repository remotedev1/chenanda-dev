// hooks/useFamily.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

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

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    setError(null);

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

      setFamilies(data.data.data || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load families", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchFamilies();
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

  const fetchFamily = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/families/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch family");
      }

      setFamily(data.data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load family details", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const refresh = useCallback(() => {
    fetchFamily();
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

  const updateFamily = useCallback(async (data) => {
    setUpdating(true);

    try {
      const response = await fetch(`/api/families/${data.id}`, {
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
