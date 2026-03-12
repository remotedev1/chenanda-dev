// hooks/usePlayer.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API_BASE = "/api/families/players";

/**
 * Hook to fetch players with pagination, search, and filters
 */
export function usePlayers() {
  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sport: undefined,
    status: undefined,
    sortBy: "playerName",
    page: 1,
    limit: 1000,
  });

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.sport) params.append("sport", filters.sport);
      if (filters.status) params.append("status", filters.status);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());


      const response = await fetch(`${API_BASE}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch players");

      const { data } = await response.json();
      setPlayers(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players,
    pagination,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

/**
 * Hook to create a new player
 */
export function useCreatePlayer() {
  const [creating, setCreating] = useState(false);

  const createPlayer = async (data) => {
    setCreating(true);
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create player");
      }

      const result = await response.json();
      toast.success("Player created successfully");
      return result;
    } catch (error) {
      console.error("Error creating player:", error);
      toast.error(error.message || "Failed to create player");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return { createPlayer, creating };
}

/**
 * Hook to update an existing player
 */
export function useUpdatePlayer() {
  const [updating, setUpdating] = useState(false);

  const updatePlayer = async (id, data) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update player");
      }

      const result = await response.json();
      toast.success("Player updated successfully");
      return result;
    } catch (error) {
      console.error("Error updating player:", error);
      toast.error(error.message || "Failed to update player");
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updatePlayer, updating };
}

/**
 * Hook to delete a player
 */
export function useDeletePlayer() {
  const [deleting, setDeleting] = useState(false);

  const deletePlayer = async (id, name) => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete player");
      }

      toast.success(`Player "${name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.error(error.message || "Failed to delete player");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deletePlayer, deleting };
}

/**
 * Hook to fetch a single player by ID
 */
export function usePlayer(id) {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchPlayer = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error("Failed to fetch player");

        const data = await response.json();
        setPlayer(data.data || data);
      } catch (err) {
        console.error("Error fetching player:", err);
        setError(err.message);
        toast.error("Failed to load player details");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [id]);

  return { player, loading, error };
}

/**
 * Hook to fetch players by family ID
 */
export function usePlayersByFamily(familyId) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!familyId) {
      setLoading(false);
      return;
    }

    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_BASE}?familyId=${familyId}&limit=1000`,
        );
        if (!response.ok) throw new Error("Failed to fetch family players");

        const data = await response.json();
        setPlayers(data.data || []);
      } catch (err) {
        console.error("Error fetching family players:", err);
        setError(err.message);
        toast.error("Failed to load family players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [familyId]);

  return { players, loading, error };
}

/**
 * Hook to batch create multiple players
 */
export function useBatchCreatePlayers() {
  const [creating, setCreating] = useState(false);

  const batchCreatePlayers = useCallback(async (playersData) => {
    setCreating(true);
    try {
      const response = await fetch(`${API_BASE}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players: playersData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create players");
      }

      const result = await response.json();
      toast.success(`${playersData.length} player(s) created successfully`);
      return result;
    } catch (error) {
      console.error("Error batch creating players:", error);
      toast.error(error.message || "Failed to create players");
      throw error;
    } finally {
      setCreating(false);
    }
  }, []);

  return { batchCreatePlayers, creating };
}
