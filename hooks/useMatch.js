// hooks/useMatch.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export function useMatches({ tournamentId, gameId } = {}) {
  const [matches, setMatches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sport: undefined,
    status: undefined,
    round: undefined,
    pool: undefined,
    venue: undefined,
    sortBy: "scheduledOn",
    sortOrder: "asc",
    page: 1,
    limit: 10,
  });

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tournamentId) params.append("tournamentId", tournamentId);
      if (gameId) params.append("gameId", gameId);
      if (filters.search) params.append("search", filters.search);
      if (filters.sport) params.append("sport", filters.sport);
      if (filters.status) params.append("status", filters.status);
      if (filters.round) params.append("round", filters.round);
      if (filters.pool) params.append("pool", filters.pool);
      if (filters.venue) params.append("venue", filters.venue);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches?${params}`,
      );
      if (!response.ok) throw new Error("Failed to fetch matches");

      const data = await response.json();
      setMatches(data.data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  }, [filters, tournamentId, gameId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    pagination,
    loading,
    filters,
    updateFilters,
    setPage,
    refresh,
  };
}

export function useCreateMatch(tournamentId) {
  const [creating, setCreating] = useState(false);

  const createMatch = async (data) => {
    setCreating(true);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create match");
      }
      const result = await response.json();
      toast.success("Match created successfully");
      return result;
    } catch (error) {

      toast.error(error.message || "Failed to create match");
      throw error;
    } finally {
      setCreating(false);
    }
  };

  return { createMatch, creating };
}

export function useUpdateMatch() {
  const [updating, setUpdating] = useState(false);

  const updateMatch = async (id, data) => {
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update match");
      }
      const result = await response.json();
      toast.success("Match updated successfully");
      return result;
    } catch (error) {
      toast.error(error.message || "Failed to update match");
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return { updateMatch, updating };
}

export function useLiveMatchControl(matchId) {
  const [loading, setLoading] = useState(false);

  const sendAction = useCallback(
    async (action, payload = {}) => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/tournaments/${tournamentId}/matches/${matchId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, ...payload }),
          },
        );
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Action failed");
        }
        const result = await response.json();
        return result.data;
      } catch (error) {
        toast.error(error.message || "Action failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [matchId],
  );

  const startMatch = () => sendAction("START_MATCH");
  const endMatch = () => sendAction("END_MATCH");
  const setPeriod = (period) => sendAction("SET_PERIOD", { period });
  const setStatus = (status) => sendAction("SET_STATUS", { status });
  const setWinner = (winnerId, winnerName) =>
    sendAction("SET_WINNER", { winnerId, winnerName, isDraw: false });
  const setDraw = () => sendAction("SET_DRAW");
  const setManOfMatch = (manOfTheMatchId) =>
    sendAction("SET_MAN_OF_MATCH", { manOfTheMatchId });
  const addNote = (note) => sendAction("ADD_NOTE", { note });

  return {
    loading,
    startMatch,
    endMatch,
    setPeriod,
    setStatus,
    setWinner,
    setDraw,
    setManOfMatch,
    addNote,
  };
}

export function useDeleteMatch() {
  const [deleting, setDeleting] = useState(false);

  const deleteMatch = async (id, name) => {
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete match");
      }
      toast.success(`Match "${name}" deleted successfully`);
    } catch (error) {
      toast.error(error.message || "Failed to delete match");
      throw error;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteMatch, deleting };
}

export function useMatch({ tournamentId, id }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch match");
      const data = await response.json();
      setMatch(data.data.data || data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load match details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  return { match, loading, error, refresh: fetchMatch };
}
