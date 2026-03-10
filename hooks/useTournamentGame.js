// hooks/useGames.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useGames(dataParams) {
  const [games, setGames] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sportType: undefined,
    category: undefined,
    isActive: undefined,
    sortBy: "date",
    sortOrder: "asc",
    page: 1,
    limit: 40,
  });

  const fetchGames = useCallback(async () => {
    if (!dataParams?.tournamentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
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

      const response = await fetch(
        `/api/tournaments/${process.env.NEXT_PUBLIC_TOURNAMENT_ID}/games?${params}`,
      );
      if (!response.ok) throw new Error("Failed to fetch games");

      const { data } = await response.json();
      setGames(data.data || []);
      setTournament(data.data.tournament || null);
      setPagination(data.data.pagination || null);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load games");
    } finally {
      setLoading(false);
    }
  }, [filters, dataParams?.tournamentId]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    tournament,
    pagination,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

export function useCreateGame(tournamentId) {
  const [creating, setCreating] = useState(false);

  const createGame = async (data) => {
    if (!tournamentId) {
      toast.error("Tournament ID is required");
      throw new Error("Tournament ID is required");
    }

    setCreating(true);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Failed to create game",
        );
      }

      const result = await response.json();
      toast.success("Game created successfully");
      return result;
    } catch (error) {
      toast.error(error.message || "Failed to create game");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return { createGame, creating };
}

export function useUpdateGame(tournamentId) {
  const [updating, setUpdating] = useState(false);

  const updateGame = async (gameId, data) => {
    if (!tournamentId || !gameId) {
      toast.error("Tournament ID and Game ID are required");
      throw new Error("Tournament ID and Game ID are required");
    }

    setUpdating(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/games/${gameId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Failed to update game",
        );
      }

      const result = await response.json();
      toast.success("Game updated successfully");
      return result;
    } catch (error) {
      toast.error(error.message || "Failed to update game");
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updateGame, updating };
}

export function useDeleteGame(tournamentId) {
  const [deleting, setDeleting] = useState(false);

  const deleteGame = async (gameId, name) => {
    if (!tournamentId || !gameId) {
      toast.error("Tournament ID and Game ID are required");
      throw new Error("Tournament ID and Game ID are required");
    }

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/games/${gameId}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || error.message || "Failed to delete game",
        );
      }

      toast.success(`Game "${name}" deleted successfully`);
    } catch (error) {
      toast.error(error.message || "Failed to delete game");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteGame, deleting };
}

export function useGame({ tournamentId, gameId }) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGame = useCallback(async () => {
    if (!tournamentId || !gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/games/${gameId}`,
      );

      if (!response.ok) throw new Error("Failed to fetch game");

      const data = await response.json();
      setGame(data.data || data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load game details");
    } finally {
      setLoading(false);
    }
  }, [tournamentId, gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  return { game, loading, error, refresh: fetchGame };
}
