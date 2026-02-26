// hooks/useGame.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API_BASE = "/api/tournament-games";

/**
 * Hook to fetch tournament games with pagination, search, and filters
 */
export function useGames(tournamentId) {
  const [games, setGames] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sportType: undefined,
    category: undefined,
    status: undefined,
    sortBy: "name",
    page: 1,
    limit: 10,
  });

  const fetchGames = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("tournamentId", tournamentId);
      if (filters.search) params.append("search", filters.search);
      if (filters.sportType) params.append("sportType", filters.sportType);
      if (filters.category) params.append("category", filters.category);
      if (filters.status) params.append("status", filters.status);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(`${API_BASE}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch games");

      const data = await response.json();
      setGames(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Failed to load tournament games");
    } finally {
      setLoading(false);
    }
  }, [filters, tournamentId]);

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
    pagination,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

/**
 * Hook to create a new tournament game
 */
export function useCreateGame() {
  const [creating, setCreating] = useState(false);

  const createGame = async (data) => {
    setCreating(true);
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create game");
      }

      const result = await response.json();
      toast.success("Tournament game created successfully");
      return result;
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error(error.message || "Failed to create game");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return { createGame, creating };
}

/**
 * Hook to update an existing tournament game
 */
export function useUpdateGame() {
  const [updating, setUpdating] = useState(false);

  const updateGame = async (id, data) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update game");
      }

      const result = await response.json();
      toast.success("Tournament game updated successfully");
      return result;
    } catch (error) {
      console.error("Error updating game:", error);
      toast.error(error.message || "Failed to update game");
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updateGame, updating };
}

/**
 * Hook to delete a tournament game
 */
export function useDeleteGame() {
  const [deleting, setDeleting] = useState(false);

  const deleteGame = async (id, name) => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete game");
      }

      toast.success(`Game "${name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting game:", error);
      toast.error(error.message || "Failed to delete game");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteGame, deleting };
}

/**
 * Hook to fetch a single tournament game by ID
 */
export function useGame(id) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error("Failed to fetch game");

        const data = await response.json();
        setGame(data.data || data);
      } catch (err) {
        console.error("Error fetching game:", err);
        setError(err.message);
        toast.error("Failed to load game details");
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  return { game, loading, error };
}