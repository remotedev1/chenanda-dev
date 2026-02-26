// hooks/useFamily.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API_BASE = "/api/families";

/**
 * Hook to fetch families with pagination, search, and filters
 */
export function useFamilies() {
  const [families, setFamilies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "familyName",
    page: 1,
    limit: 10,
  });

  const fetchFamilies = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(`${API_BASE}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch families");

      const data = await response.json();
      setFamilies(data.data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching families:", error);
      toast.error("Failed to load families");
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
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

/**
 * Hook to create a new family
 */
export function useCreateFamily() {
  const [creating, setCreating] = useState(false);

  const createFamily = async (data) => {
    setCreating(true);
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create family");
      }

      const result = await response.json();
      toast.success("Family created successfully");
      return result;
    } catch (error) {
      console.error("Error creating family:", error);
      toast.error(error.message || "Failed to create family");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return { createFamily, creating };
}

/**
 * Hook to update an existing family
 */
export function useUpdateFamily() {
  const [updating, setUpdating] = useState(false);

  const updateFamily = async (id, data) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update family");
      }

      const result = await response.json();
      toast.success("Family updated successfully");
      return result;
    } catch (error) {
      console.error("Error updating family:", error);
      toast.error(error.message || "Failed to update family");
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updateFamily, updating };
}

/**
 * Hook to delete a family
 */
export function useDeleteFamily() {
  const [deleting, setDeleting] = useState(false);

  const deleteFamily = async (id, name) => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete family");
      }

      toast.success(`Family "${name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting family:", error);
      toast.error(error.message || "Failed to delete family");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteFamily, deleting };
}

/**
 * Hook to fetch a single family by ID
 */
export function useFamily(id) {
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchFamily = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error("Failed to fetch family");

        const data = await response.json();
        setFamily(data);
      } catch (err) {
        console.error("Error fetching family:", err);
        setError(err.message);
        toast.error("Failed to load family details");
      } finally {
        setLoading(false);
      }
    };

    fetchFamily();
  }, [id]);

  return { family, loading, error };
}