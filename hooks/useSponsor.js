import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useSponsors(initialFilters = {}) {
  const [sponsors, setSponsors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    ...initialFilters,
  });

  const fetchSponsors = useCallback(async () => {
    try {
      setLoading(true);

      // Build params object, filtering out undefined/null values
      const params = new URLSearchParams();
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      if (filters.search) {
        params.append("search", filters.search);
      }

      if (filters.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy);
      }

      if (filters.sortOrder) {
        params.append("sortOrder", filters.sortOrder);
      }

      const response = await fetch(`/api/tournaments/sponsors?${params}`);
      const data = await response.json();

      if (data.success) {
        setSponsors(data.data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages,
        }));
      } else {
        toast.error(data.error || "Failed to fetch sponsors");
      }
    } catch (error) {
      toast.error("Failed to fetch sponsors");
      console.error("Fetch sponsors error:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);



  // STABLE updateFilters - no dependencies that change
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []); // Empty array - completely stable

  const setPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchSponsors();
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
