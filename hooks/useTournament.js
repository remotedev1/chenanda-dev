import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Fetch tournaments with filters
export function useTournaments(initialFilters = {}) {
  const [tournaments, setTournaments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

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

      setTournaments(data.data.tournaments || []);
      setPagination(data.data.pagination || null);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load tournaments", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchTournaments();
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTournament = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        includeParticipation: options.includeParticipation || false,
        includeMatches: options.includeMatches || false,
        includePlacements: options.includePlacements || false,
      });

      const response = await fetch(
        `/api/tournaments/${id}?${params.toString()}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tournament");
      }

      setTournament(data.data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load tournament", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [
    id,
    options.includeParticipation,
    options.includeMatches,
    options.includePlacements,
  ]);

  useEffect(() => {
    fetchTournament();
  }, [fetchTournament]);

  const refresh = useCallback(() => {
    fetchTournament();
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

      toast.success("Tournament created successfully", {
        description: `${data.name} has been created`,
      });

      return result.data;
    } catch (err) {
      toast.error("Failed to create tournament", {
        description: err.message,
      });
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

      toast.success("Tournament updated successfully", {
        description: `${result.data.name} has been updated`,
      });

      return result.data;
    } catch (err) {
      toast.error("Failed to update tournament", {
        description: err.message,
      });
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

      toast.success(result.message || "Tournament deleted successfully", {
        description: tournamentName,
      });

      return result.data;
    } catch (err) {
      toast.error("Failed to delete tournament", {
        description: err.message,
      });
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteTournament, deleting };
}
